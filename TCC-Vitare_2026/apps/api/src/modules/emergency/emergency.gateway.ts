import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { RedisService } from '../../infra/redis/redis.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/emergency',
})
export class EmergencyGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EmergencyGateway.name);
  private readonly connectedUsers = new Map<string, Set<string>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {}

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(
          `Connection rejected: no token provided (${client.id})`,
        );
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.config.get<string>('STAFF_JWT_SECRET'),
      });

      if (!payload || payload.type !== 'staff') {
        this.logger.warn(
          `Connection rejected: invalid token type (${client.id})`,
        );
        client.disconnect();
        return;
      }

      client.userId = payload.sub;
      client.userRole = payload.role;

      const userSockets = this.connectedUsers.get(payload.sub) || new Set();
      userSockets.add(client.id);
      this.connectedUsers.set(payload.sub, userSockets);

      client.join(`staff:${payload.sub}`);
      client.join(`role:${payload.role}`);

      await this.redis.geoadd('staff:locations', 0, 0, payload.sub);

      this.logger.log(`Staff connected: ${payload.sub} (${client.id})`);
    } catch (error) {
      this.logger.warn(`Connection rejected: ${error.message} (${client.id})`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    if (client.userId) {
      const userSockets = this.connectedUsers.get(client.userId);
      if (userSockets) {
        userSockets.delete(client.id);
        if (userSockets.size === 0) {
          this.connectedUsers.delete(client.userId);
        }
      }
      this.logger.log(`Staff disconnected: ${client.userId} (${client.id})`);
    }
  }

  @SubscribeMessage('updateLocation')
  async handleLocationUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { latitude: number; longitude: number },
  ): Promise<{ success: boolean }> {
    if (!client.userId) {
      return { success: false };
    }

    if (
      data.latitude < -90 ||
      data.latitude > 90 ||
      data.longitude < -180 ||
      data.longitude > 180
    ) {
      return { success: false };
    }

    await this.redis.geoadd(
      'staff:locations',
      data.longitude,
      data.latitude,
      client.userId,
    );

    this.server.to(`staff:${client.userId}`).emit('locationUpdated', {
      latitude: data.latitude,
      longitude: data.longitude,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }

  @SubscribeMessage('subscribeEmergencies')
  handleSubscribeEmergencies(@ConnectedSocket() client: AuthenticatedSocket): {
    success: boolean;
  } {
    if (!client.userId) {
      return { success: false };
    }

    client.join('emergencies:all');
    return { success: true };
  }

  @SubscribeMessage('unsubscribeEmergencies')
  handleUnsubscribeEmergencies(
    @ConnectedSocket() client: AuthenticatedSocket,
  ): { success: boolean } {
    if (!client.userId) {
      return { success: false };
    }

    client.leave('emergencies:all');
    return { success: true };
  }

  broadcastEmergencyTriggered(
    emergencyId: string,
    payload: Record<string, unknown>,
  ): void {
    this.server.to('emergencies:all').emit('emergency:triggered', {
      emergencyId,
      ...payload,
      timestamp: new Date().toISOString(),
    });

    this.server.to('role:MEDICO_SOCORRISTA').emit('emergency:triggered', {
      emergencyId,
      ...payload,
      timestamp: new Date().toISOString(),
    });

    this.server.to('role:ENFERMEIRO_SOCORRISTA').emit('emergency:triggered', {
      emergencyId,
      ...payload,
      timestamp: new Date().toISOString(),
    });

    this.server.to('role:OPERADOR_TACTICAL').emit('emergency:triggered', {
      emergencyId,
      ...payload,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Broadcasted emergency triggered: ${emergencyId}`);
  }

  broadcastEmergencyAssigned(
    emergencyId: string,
    payload: Record<string, unknown>,
  ): void {
    this.server.to('emergencies:all').emit('emergency:assigned', {
      emergencyId,
      ...payload,
      timestamp: new Date().toISOString(),
    });

    if (payload.assignedStaffId) {
      this.server
        .to(`staff:${payload.assignedStaffId}`)
        .emit('emergency:assigned', {
          emergencyId,
          ...payload,
          timestamp: new Date().toISOString(),
        });
    }

    this.logger.log(`Broadcasted emergency assigned: ${emergencyId}`);
  }

  broadcastEmergencyResolved(
    emergencyId: string,
    payload: Record<string, unknown>,
  ): void {
    this.server.to('emergencies:all').emit('emergency:resolved', {
      emergencyId,
      ...payload,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Broadcasted emergency resolved: ${emergencyId}`);
  }

  async getNearbyStaff(
    latitude: number,
    longitude: number,
    radiusMeters: number,
  ): Promise<string[]> {
    const results = await this.redis.geosearch(
      'staff:locations',
      longitude,
      latitude,
      radiusMeters,
      20,
    );
    return results.map((r) => r.member);
  }
}
