import mongoose from 'mongoose'

console.log('Is valid ObjectId?', mongoose.Types.ObjectId.isValid('usr-admin-1'))
try {
  new mongoose.Types.ObjectId('usr-admin-1')
} catch (e) {
  console.log('Threw error:', e.message)
}
