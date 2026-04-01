export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface UserWithPassword extends User {
  password: string;
}
