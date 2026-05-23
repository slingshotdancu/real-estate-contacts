import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import {
  useGetPersonalContacts,
  useCreatePersonalContact,
  useUpdatePersonalContact,
  useDeletePersonalContact,
} from "@workspace/api-client-react";

export interface PersonalContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
const { data, isLoading: loading, refetch, error } = useGetPersonalContacts();

useEffect(() => {
  if (error) {
    console.error("Error fetching personal contacts:", error);
  }
  console.log("Personal contacts data:", data);
}, [data, error]);

const contacts = Array.isArray(data) ? data : [];
type NewPersonalContact = Omit<PersonalContact, "id" | "createdAt" | "updatedAt">;
type UpdatePersonalContact = Partial<Omit<PersonalContact, "id" | "createdAt" | "updatedAt">>;

interface PersonalContactsContextValue {
  contacts: PersonalContact[];
  loading: boolean;
  addContact: (data: NewPersonalContact) => Promise<PersonalContact>;
  updateContact: (id: string, data: UpdatePersonalContact) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  getContact: (id: string) => PersonalContact | undefined;
}

const PersonalContactsContext = createContext<PersonalContactsContextValue | undefined>(
  undefined
);

export function PersonalContactsProvider({ children }: { children: ReactNode }) {
  const { data: contacts = [], isLoading: loading, refetch } = useGetPersonalContacts();
  const createMutation = useCreatePersonalContact();
  const updateMutation = useUpdatePersonalContact();
  const deleteMutation = useDeletePersonalContact();

  useEffect(() => {
    import("@/constants/api");
  }, []);

  const addContact = useCallback(
    async (data: NewPersonalContact): Promise<PersonalContact> => {
      const result = await createMutation.mutateAsync({
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email,
          notes: data.notes || "",
        },
      });
      
      await refetch();
      
      return {
        id: result.id.toString(),
        name: result.name,
        phone: result.phone,
        email: result.email,
        notes: result.notes || "",
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };
    },
    [createMutation, refetch]
  );

  const updateContact = useCallback(
    async (id: string, data: UpdatePersonalContact): Promise<void> => {
      await updateMutation.mutateAsync({
        id: parseInt(id),
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email,
          notes: data.notes,
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
    (id: string): PersonalContact | undefined => {
      const contact = contacts.find((c: any) => c.id.toString() === id);
      if (!contact) return undefined;
      
      return {
        id: contact.id.toString(),
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        notes: contact.notes || "",
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
      };
    },
    [contacts]
  );

const transformedContacts: PersonalContact[] = contacts.map((c: any) => ({  
    id: c.id.toString(),
    name: c.name,
    phone: c.phone,
    email: c.email,
    notes: c.notes || "",
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));

  return (
    <PersonalContactsContext.Provider
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
    </PersonalContactsContext.Provider>
  );
}

export function usePersonalContacts(): PersonalContactsContextValue {
  const ctx = useContext(PersonalContactsContext);
  if (!ctx) throw new Error("usePersonalContacts must be used within PersonalContactsProvider");
  return ctx;
}