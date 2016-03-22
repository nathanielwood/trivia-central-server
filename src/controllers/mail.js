import fetch from 'isomorphic-fetch';
import util from 'util';
import config from '../../config';
import ejs from 'ejs';
import fs from 'fs';

const sendMail = (info) => {
  const body = {
    content: {
      from: config.mail_api.from,
      subject: info.subject,
      html: info.html,
    },
    recipients: [{
      address: {
        email: info.email,
        name: info.name,
      },
    }],
  };
  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: config.mail_api.key,
    },
    body: JSON.stringify(body),
  };
  if (process.env.NODE_ENV !== 'production') {
    let log = '';
    log += '----------\n';
    log += 'MOCK EMAIL\n';
    log += '----------\n';
    log += config.mail_api.url;
    console.log(log); // eslint-disable-line
    console.log(util.inspect(body, { depth: null, colors: true })); // eslint-disable-line
    console.log('----------'); // eslint-disable-line
  } else {
    fetch(config.mail_api.url, options)
    .then(response => response.json())
    .then((json) => {
      console.log(json); // eslint-disable-line
      // TODO: logging
    });
  }
};

export const registerMail = (user) => {
  const template = fs.readFileSync(`${__dirname}/../mail/register.ejs`, 'utf8');
  const html = ejs.render(template, { name: user.name });
  sendMail({
    email: user.email,
    name: user.name,
    subject: 'Thanks for signing up',
    html,
  });
};

export const forgotPasswordMail = (info) => {
  const template = fs.readFileSync(`${__dirname}/../mail/forgotPassword.ejs`, 'utf8');
  const html = ejs.render(template, { name: info.name, link: info.link });
  sendMail({
    email: info.email,
    name: info.name,
    subject: 'Reset your password',
    html,
  });
};
