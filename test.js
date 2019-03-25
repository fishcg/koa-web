const User = require('./models/User')


async function go() {
  try {
    /*let newUser = await User.create({
      username: 'fish2',
      gender: false,
      email: '3537409022222@qq.com',
      mobile: '15685598428022',
      password: 'test-passward',
      avatar: 'test.jpg',
    })*/
    let aa = await User.findAndCountAll({
      attributes: {exclude: ['username']},
      raw: true,
      where: {
        id: 16,
      },
    })

    console.log(aa)
    /*let aa = User.find()
    console.log(aa)*/
  } catch (e) {
    console.log(e.errors)
  }


}
go()

