const express = require('express')
const AuthService = require('./auth-service')

authRouter = express.Router()
const jsonBodyParser = express.json()

authRouter 
  .post('/', jsonBodyParser, (req, res, next) => {
    const {user_name, password} = req.body
    const loginUser = {user_name, password}

    for(const [key, value] of Object.entries(loginUser))
      if(value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        })
    
    AuthService.getUserWithUserName(req.app.get('db'), user_name)
      .then(dbUser => {
        if(!dbUser)
          return res.status(400).json({
            error: 'Incorrect Username or Password'
          })
        return AuthService.comparePasswords(loginUser.password, dbUser.password)
          .then(compare => {
            if (!compare)
              return res.status(400).json({
                error: 'Incorrect Username or Password'
              })

            const subject = dbUser.user_name
            const payload = {user_id: dbUser.id, user_name}
            res.send({
              authToken: AuthService.createJwt(subject, payload),
              userId: payload.user_id,
              user_name: payload.user_name
            })
          })
      })
      .catch(next)
  })

module.exports = authRouter