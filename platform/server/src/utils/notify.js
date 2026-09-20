const Notification = require('../models/Notification');
const { sendEmail, emailTemplates } = require('./email');

/**
 * Create an in-app notification and optionally send email.
 * @param {object} opts
 * @param {string} opts.userId
 * @param {string} opts.type
 * @param {string} opts.title
 * @param {string} opts.body
 * @param {string} [opts.link]
 * @param {object} [opts.data]
 * @param {object} [opts.email]  - { to, templateName, templateArgs }
 */
const notify = async ({ userId, type, title, body, link, data, email }) => {
  try {
    await Notification.create({ user: userId, type, title, body, link, data });

    if (email) {
      const tpl = emailTemplates[email.templateName]?.(...(email.templateArgs || []));
      if (tpl) {
        await sendEmail({ to: email.to, ...tpl });
      }
    }
  } catch (err) {
    console.error('[notify] Failed:', err.message);
  }
};

module.exports = { notify };
