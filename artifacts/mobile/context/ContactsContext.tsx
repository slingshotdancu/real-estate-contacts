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
  PersonalContact,
  useGetPersonalContacts,
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
const { data, isLoading: loading, refetch, error } = useGetPersonalContacts();

// Add this right after the hook call
useEffect(() => {
  if (error) {
    console.error("Error fetching personal contacts:", error);
  }
  console.log("Personal contacts data:", data);
}, [data, error]);

const contacts = Array.isArray(data) ? data : [];
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
  // Use the generated API hooks
  const { data: contacts = [], isLoading: loading, refetch } = useGetContacts();
  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact();
  const deleteMutation = useDeleteContact();

  // Import the API config to ensure base URL is set
  useEffect(() => {
    import("@/constants/api");
  }, []);

  const addContact = useCallback(
    async (data: NewContact): Promise<Contact> => {
      const result = await createMutation.mutateAsync({
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email,
          notes: data.notes || "",
          properties: data.properties || [],
          // Cast to any to satisfy generated API type (InsertContactStage)
          stage: data.stage as any,
        },
      });
      
      await refetch();
      
      // Convert the API response to match the Contact interface
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

  // Transform API contacts to match the Contact interface
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