export default {
  eggs: [
    {
      text: 'Goose Emoji',
      message: 'Did you know there is no goose emoji? The most used one as a standin is a swan (\u{1F9A2}). Very sad.'
    },
    {
      text: 'That\'s Numberwang!',
      message: 'That\'s Wangernum!'
    },
    {
      text: 'When does Atmosphere come out?',
      message: 'June 15th!'
    },
    {
      text: 'What is the meaning of life?',
      message: '42, duh.'
    },
    {
      text: 'Honk',
      message: 'Honk'
    },
    {
      text: 'GooseMod',
      message: 'You talking about me? ;)'
    }
  ],

  interval: 0,

  check: () => {
    let el = document.getElementsByClassName('slateTextArea-1Mkdgw')[0];

    if (!el) return;

    for (let e of globalThis.messageEasterEggs.eggs) {
      if (el.textContent === e.text) {
        if (e.cooldown) {
          e.cooldown -= 1;
          continue;
        }

        globalThis.showToast(e.message);

        e.cooldown = (e.cooldown || 6) - 1;
      }
    }
  }
};