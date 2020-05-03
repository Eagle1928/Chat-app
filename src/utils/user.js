const users = []

const addUser = ({id,username,room}) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate if user and room exists
    if(!username || !room) {
        return {
            error: 'Username and room are required'
        }   
    }
    //check fo existing user
    const exisitingUser = users.find((user)=> {
        return user.room === room && user.username === username
    })
   //validate user name
    if(exisitingUser) {
        return {
            error: 'Username is in use!'
        }
    }
    //Store user
    const user = {id,username,room}
    users.push(user)
    return {user}
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if(index !== -1) {
        return users.splice(index, 1)[0] // splice returns array of removed objects
    }
}

const getUser = (id) => {
   return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}