import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersonalCategory } from "@/constants/personalCategories";

export interface PersonalContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  relationship: string;
  birthday: string;
  notes: string;
  category: PersonalCategory;
  createdAt: string;
  updatedAt: string;
}

type NewPersonalContact = Omit<
  PersonalContact,
  "id" | "createdAt" | "updatedAt"
>;
type UpdatePersonalContact = Partial<
  Omit<PersonalContact, "id" | "createdAt" | "updatedAt">
>;

interface PersonalContactsContextValue {
  contacts: PersonalContact[];
  loading: boolean;
  addContact: (data: NewPersonalContact) => Promise<PersonalContact>;
  updateContact: (id: string, data: UpdatePersonalContact) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  getContact: (id: string) => PersonalContact | undefined;
}

const PersonalContactsContext = createContext<
  PersonalContactsContextValue | undefined
>(undefined);

const STORAGE_KEY = "@jh_personal_contacts_v1";

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

const SAMPLE_PERSONAL_CONTACTS: PersonalContact[] = [
  {
    id: "personal-sample-1",
    name: "Karen Hackler",
    phone: "(770) 555-0144",
    email: "karen.hackler@gmail.com",
    relationship: "Mom",
    birthday: "March 12",
    notes: "Always check in on Sundays. Loves when I call after church.",
    category: "family",
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "personal-sample-2",
    name: "Jessica Martinez",
    phone: "(404) 555-0291",
    email: "jess.martinez@gmail.com",
    relationship: "Best Friend",
    birthday: "July 4",
    notes:
      "College roommate and forever bestie. She moved to Austin last year but we talk every week.",
    category: "close_friend",
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "personal-sample-3",
    name: "Tom & Amy Hackler",
    phone: "(678) 555-0378",
    email: "tom.hackler@gmail.com",
    relationship: "Brother & Sister-in-law",
    birthday: "November 22",
    notes: "Kids are Lily (7) and Theo (4). Visit on holidays. Tom's birthday is the 22nd.",
    category: "family",
    createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: "personal-sample-4",
    name: "Natalie Sanders",
    phone: "(555) 555-0467",
    email: "natalie.s@icloud.com",
    relationship: "Yoga Friend",
    birthday: "",
    notes: "Tuesday morning yoga class. Great energy. Recommended the new Pilates studio on 5th.",
    category: "friend",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
];

export function PersonalContactsProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = useState<PersonalContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setContacts(JSON.parse(stored));
        } else {
          setContacts(SAMPLE_PERSONAL_CONTACTS);
          await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(SAMPLE_PERSONAL_CONTACTS)
          );
        }
      } catch {
        setContacts(SAMPLE_PERSONAL_CONTACTS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (updated: PersonalContact[]) => {
    setContacts(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const addContact = useCallback(
    async (data: NewPersonalContact): Promise<PersonalContact> => {
      const now = new Date().toISOString();
      const contact: PersonalContact = {
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
    async (id: string, data: UpdatePersonalContact): Promise<void> => {
      const updated = contacts.map((c) =>
        c.id === id
          ? { ...c, ...data, updatedAt: new Date().toISOString() }
          : c
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
    (id: string): PersonalContact | undefined =>
      contacts.find((c) => c.id === id),
    [contacts]
  );

  return (
    <PersonalContactsContext.Provider
      value={{ contacts, loading, addContact, updateContact, deleteContact, getContact }}
    >
      {children}
    </PersonalContactsContext.Provider>
  );
}

export function usePersonalContacts(): PersonalContactsContextValue {
  const ctx = useContext(PersonalContactsContext);
  if (!ctx)
    throw new Error(
      "usePersonalContacts must be used within PersonalContactsProvider"
    );
  return ctx;
}
