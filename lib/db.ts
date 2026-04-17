type User = {
  id: string
  email: string
  password: string
}

type Job = {
  id: string
  userId: string
  title: string
  company: string
  status: string
}

const users: User[] = []
const jobs: Job[] = []

export const db = {
  createUser: (user: User) => {
    users.push(user)
    return user
  },

  findUserByEmail: (email: string) => {
    return users.find(u => u.email === email)
  },

  getJobsByUser: (userId: string) => {
    return jobs.filter(j => j.userId === userId)
  },

  addJob: (job: Job) => {
    jobs.push(job)
    return job
  }
}
