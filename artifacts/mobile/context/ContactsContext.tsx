import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import {
  useGetContacts,
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
} from "@workspace/api-client-react";
import { Stage } from "@/constants/stages";

export interface Property {
  id: string;
  address: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  properties: Property[];
  stage: Stage;
  createdAt: string;
  updatedAt: string;
}

type NewContact = Omit<Contact, "id" | "createdAt" | "updatedAt">;
type UpdateContact = Partial<Omit<Contact, "id" | "createdAt" | "updatedAt">>;

interface ContactsContextValue {
  contacts: Contact[];
  loading: boolean;
  addContact: (data: NewContact) => Promise<Contact>;
  updateContact: (id: string, data: UpdateContact) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  getContact: (id: string) => Contact | undefined;
}

const ContactsContext = createContext<ContactsContextValue | undefined>(
  undefined
);

export function ContactsProvider({ children }: { children: ReactNode }) {
  // Hooks MUST be inside the component, not at module level
  const { data, isLoading: loading, refetch, error } = useGetContacts();
  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact();
  const deleteMutation = useDeleteContact();

  // Ensure contacts is always an array
  const contacts = Array.isArray(data) ? data : [];

  // Import the API config to ensure base URL is set
  useEffect(() => {
    import("@/constants/api");
    if (error) {
      console.error("Error fetching contacts:", error);
    }
    console.log("Contacts data:", data);
  }, [data, error]);

  const addContact = useCallback(
    async (data: NewContact): Promise<Contact> => {
      const result = await createMutation.mutateAsync({
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email,
          notes: data.notes || "",
          properties: data.properties || [],
          stage: data.stage as any,
        },
      });
      
      await refetch();
      
      return {
        id: result.id.toString(),
        name: result.name,
        phone: result.phone,
        email: result.email,
        notes: result.notes || "",
        properties: (result.properties as Property[]) || [],
        stage: result.stage as Stage,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };
    },
    [createMutation, refetch]
  );

  const updateContact = useCallback(
    async (id: string, data: UpdateContact): Promise<void> => {
      await updateMutation.mutateAsync({
        id: parseInt(id),
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email,
          notes: data.notes,
          properties: data.properties,
          stage: data.stage as any,
        },
      });
      await refetch();
    },
    [updateMutation, refetch]
  );

  const deleteContact = useCallback(
    async (id: string): Promise<void> => {
      await deleteMutation.mutateAsync({ id: parseInt(id) });
      await refetch();
    },
    [deleteMutation, refetch]
  );

  const getContact = useCallback(
    (id: string): Contact | undefined => {
      const contact = contacts.find((c: any) => c.id.toString() === id);
      if (!contact) return undefined;
      
      return {
        id: contact.id.toString(),
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        notes: contact.notes || "",
        properties: (contact.properties as Property[]) || [],
        stage: contact.stage as Stage,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
      };
    },
    [contacts]
  );

  const transformedContacts: Contact[] = contacts.map((c: any) => ({
    id: c.id.toString(),
    name: c.name,
    phone: c.phone,
    email: c.email,
    notes: c.notes || "",
    properties: (c.properties as Property[]) || [],
    stage: c.stage as Stage,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));

  return (
    <ContactsContext.Provider
      value={{
        contacts: transformedContacts,
        loading,
        addContact,
        updateContact,
        deleteContact,
        getContact,
      }}
    >
      {children}
    </ContactsContext.Provider>
  );
}

export function useContacts(): ContactsContextValue {
  const ctx = useContext(ContactsContext);
  if (!ctx) throw new Error("useContacts must be used within ContactsProvider");
  return ctx;
}