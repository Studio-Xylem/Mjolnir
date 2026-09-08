import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Post, CreatePostDTO, UpdatePostDTO, PostType, PostStatus } from '../models';

const USERS_COLLECTION = 'users';
const POSTS_COLLECTION = 'posts';

export const userService = {
  async create(user: Omit<User, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, USERS_COLLECTION), {
      ...user,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async getById(id: string): Promise<User | null> {
    const docRef = doc(db, USERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return null;
  },

  async getByUsername(username: string): Promise<User | null> {
    const q = query(collection(db, USERS_COLLECTION), where('username', '==', username), limit(1));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const doc = querySnap.docs[0];
      return { id: doc.id, ...doc.data() } as User;
    }
    return null;
  },
};

export const postService = {
  async create(post: CreatePostDTO): Promise<string> {
    const docRef = await addDoc(collection(db, POSTS_COLLECTION), {
      ...post,
      status: PostStatus.ACTIVE,
      pictureUrl: post.pictureUrl || '',
      currentCustody: '',
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async getById(id: string): Promise<Post | null> {
    const docRef = doc(db, POSTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Post;
    }
    return null;
  },

  async getByUserId(userId: string): Promise<Post[]> {
    const q = query(
      collection(db, POSTS_COLLECTION), 
      where('userId', '==', userId), 
      orderBy('createdAt', 'desc')
    );
    const querySnap = await getDocs(q);
    return querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
  },

  async getByType(type: PostType): Promise<Post[]> {
    const q = query(
      collection(db, POSTS_COLLECTION), 
      where('type', '==', type), 
      where('status', '==', PostStatus.ACTIVE),
      orderBy('createdAt', 'desc')
    );
    const querySnap = await getDocs(q);
    return querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
  },

  async getByStatus(status: PostStatus): Promise<Post[]> {
    const q = query(
      collection(db, POSTS_COLLECTION), 
      where('status', '==', status), 
      orderBy('createdAt', 'desc')
    );
    const querySnap = await getDocs(q);
    return querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
  },

  async getAllActive(): Promise<Post[]> {
    const q = query(
      collection(db, POSTS_COLLECTION), 
      where('status', '==', PostStatus.ACTIVE),
      orderBy('createdAt', 'desc')
    );
    const querySnap = await getDocs(q);
    return querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
  },

  async update(id: string, updates: UpdatePostDTO): Promise<void> {
    const docRef = doc(db, POSTS_COLLECTION, id);
    await updateDoc(docRef, updates);
  },

  async updateStatus(id: string, status: PostStatus): Promise<void> {
    const docRef = doc(db, POSTS_COLLECTION, id);
    await updateDoc(docRef, { status });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, POSTS_COLLECTION, id);
    await deleteDoc(docRef);
  },
};