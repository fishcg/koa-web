const { User } = require('./Model')


async function go() {
  try {
    let newUser = await User.create({
      username: 'fish2',
      gender: false,
      email: '353740902222@qq.com',
      mobile: '1568559842802',
      password: 'test-passward',
      avatar: 'test.jpg',
    })
  } catch (e) {
    console.log(e.errors)
  }


}
go()

