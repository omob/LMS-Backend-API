# LMS BACKEND API

This project contains the backend API code for the [LMS Front end](https://github.com/omob/LMS-FRONTEND) Application

## Configuration

Create a `development.json` file under the `./app/config` directory. Populate the json file like so:

```
{
    "host" : "http://localhost:3000",
    "dbURI": "<YOUR MONGODB URL>" #mongodb://<dbuser>:<dbpassword>@ds113736.mlab.com:13736/erp,
    "sessionSecret": "f31f2f4e88b1f4c29a4542671b247f9b",
    "tokenExpire": 5300,
    "port": 3000,
    "domain": "<Your preferred domain>"#unilag.edu.ng
}

```

## Installation

```bash
$ cd lms-backend-api
$ npm install
$ npm run start
```
### Database collections for dev setup
https://1drv.ms/u/s!AtuFwKw_48h8qUm0OLgfTB264g2p?e=dx2X2w

## Live Demo

#### SOME API PATHS

[/api/courses](https://lmsbackend.herokuapp.com/api/courses)

[/api/departments](https://lmsbackend.herokuapp.com/api/departments)

[/api/faculty](https://lmsbackend.herokuapp.com/api/faculty)

[/api/programmes](https://lmsbackend.herokuapp.com/api/programmes)

[/applicant/register](https://lmsbackend.herokuapp.com/api/applicant/register)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
