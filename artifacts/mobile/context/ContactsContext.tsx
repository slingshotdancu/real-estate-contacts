import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

const STORAGE_KEY = "@jh_contacts_v1";

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

const SAMPLE_CONTACTS: Contact[] = [
  {
    id: "sample-1",
    name: "Sarah Johnson",
    phone: "(415) 555-0182",
    email: "sarah.johnson@email.com",
    notes:
      "Very motivated buyer. Pre-approved for $850K. Prefers open floor plans and updated kitchens. Needs to be near good schools.",
    properties: [
      { id: "p1", address: "2847 Pacific Avenue, San Francisco, CA" },
      { id: "p2", address: "1120 Green Street, San Francisco, CA" },
    ],
    stage: "lead",
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "sample-2",
    name: "Michael Thompson",
    phone: "(650) 555-0247",
    email: "m.thompson@techcorp.com",
    notes:
      "Relocating from Seattle. Looking for a 4BR+ with a home office. Budget up to $1.2M. Flexible on timeline.",
    properties: [{ id: "p3", address: "3512 Broadway, San Francisco, CA" }],
    stage: "prospect",
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "sample-3",
    name: "Emily & David Rodriguez",
    phone: "(510) 555-0309",
    email: "emily.rodriguez@gmail.com",
    notes:
      "First-time buyers. Very excited. Already visited 3 properties. Leaning toward the Noe Valley listing.",
    properties: [
      { id: "p4", address: "458 Sanchez Street, Noe Valley, SF" },
      { id: "p5", address: "2211 Diamond Street, Noe Valley, SF" },
      { id: "p6", address: "87 Clipper Street, Noe Valley, SF" },
    ],
    stage: "client",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "sample-4",
    name: "Robert Chen",
    phone: "(415) 555-0418",
    email: "rchen@enterprise.io",
    notes:
      "Investment buyer. Closed on 738 Jackson St last month. Looking for next opportunity in Pacific Heights.",
    properties: [{ id: "p7", address: "738 Jackson Street, Pacific Heights, SF" }],
    stage: "purchaser",
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

export function ContactsProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setContacts(JSON.parse(stored));
        } else {
          setContacts(SAMPLE_CONTACTS);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_CONTACTS));
        }
      } catch {
        setContacts(SAMPLE_CONTACTS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (updated: Contact[]) => {
    setContacts(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const addContact = useCallback(
    async (data: NewContact): Promise<Contact> => {
      const now = new Date().toISOString();
      const contact: Contact = {
        ...data,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      await persist([contact, ...contacts]);
      return contact;
    },
    [contacts, persist]
  );

  const updateContact = useCallback(
    async (id: string, data: UpdateContact): Promise<void> => {
      const updated = contacts.map((c) =>
        c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
      );
      await persist(updated);
    },
    [contacts, persist]
  );

  const deleteContact = useCallback(
    async (id: string): Promise<void> => {
      await persist(contacts.filter((c) => c.id !== id));
    },
    [contacts, persist]
  );

  const getContact = useCallback(
    (id: string): Contact | undefined => contacts.find((c) => c.id === id),
    [contacts]
  );

  return (
    <ContactsContext.Provider
      value={{ contacts, loading, addContact, updateContact, deleteContact, getContact }}
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
