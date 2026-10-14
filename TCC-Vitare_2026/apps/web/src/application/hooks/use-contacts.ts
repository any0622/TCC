import { useState, useCallback } from 'react';
import { EmergencyContact } from '../../domain/entities';
import { contactsApi } from '../../infrastructure/api/contacts.api';

export function useContacts() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContacts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await contactsApi.findAll();
      setContacts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar contatos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createContact = useCallback(async (data: { name: string; phone: string; relationship?: string; isPrimary?: boolean }) => {
    setError(null);
    try {
      const contact = await contactsApi.create(data);
      setContacts((prev) => [contact, ...prev]);
      return contact;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar contato');
      return null;
    }
  }, []);

  const removeContact = useCallback(async (id: string) => {
    setError(null);
    try {
      await contactsApi.remove(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover contato');
    }
  }, []);

  return {
    contacts,
    isLoading,
    error,
    loadContacts,
    createContact,
    removeContact,
  };
}