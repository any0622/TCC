export interface RegisterStaffCommand {
  fullName: string;
  email: string;
  cpf: string;
  registrationNumber: string;
  password: string;
}

export interface LoginStaffCommand {
  email: string;
  password: string;
}

export interface BootstrapAdminCommand {
  fullName: string;
  email: string;
  cpf: string;
  registrationNumber: string;
  password: string;
}

export interface GetStaffProfileQuery {
  staffId: string;
}

export interface StaffTokenResult {
  accessToken: string;
  staff: {
    id: string;
    fullName: string;
    email: string;
    cpf: string | null;
    registrationNumber: string;
    role: string;
  };
}