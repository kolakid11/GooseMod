let goosemodScope = {};
let unpatchers = [];

export const setThisScope = (scope) => {
  goosemodScope = scope;
};

const showSponsorModal = () => {
  const { React } = goosemodScope.webpackModules.common;

  const PremiumFeaturesList = goosemodScope.webpackModules.findByDisplayName('PremiumFeaturesList');
  const FeaturesClasses = goosemodScope.webpackModules.findByProps('roleIcon', 'profileBadgeIcon');
  const PersonShield = goosemodScope.webpackModules.findByDisplayName('PersonShield');

  const ModalComponents = goosemodScope.webpackModules.findByProps('ModalFooter');

  const { Button } = goosemodScope.webpackModules.findByPropsAll('Button')[1];
  const ButtonClasses = goosemodScope.webpackModules.findByProps('button', 'colorRed');

  const { PremiumGuildSubscriptionPurchaseModal } = goosemodScope.webpackModules.findByProps('PremiumGuildSubscriptionPurchaseModal');

  const parent = { default: PremiumGuildSubscriptionPurchaseModal };

  const makeIcon = (className, child = '') => (() => React.createElement('div', {
    style: {
      flexShrink: '0',
      marginRight: '10px',

      width: '24px',
      height: '24px'
    },

    className: FeaturesClasses[className]
  }, child));

  goosemodScope.patcher.patch(parent, 'default', ([ { onClose } ], res) => {
    res.props.id = 'gm-sponsor-modal';

    res.props.children[1].props.children = [];

    res.props.children[1].props.children.unshift(
      React.createElement('div', {
        
        },

        React.createElement('div', {}, `You can sponsor (donate regularly or one-time) GooseMod to help support it's development.`),

        React.createElement(PremiumFeaturesList, {
          columns: 2,
          features: [
            {
              description: 'Sponsor badge in GooseMod',
              overrideIcon: makeIcon('profileBadgeIcon')
            },
            {
              description: 'Sponsor role in GooseNest Discord',
              overrideIcon: makeIcon('roleIcon', React.createElement(PersonShield, { width: '24px', height: '24px' }))
            }
          ]
        }),

        React.createElement(ModalComponents.ModalFooter, {

          },

          React.createElement(Button, {
            color: ButtonClasses.colorBrand,

            type: 'submit',

            onClick: () => {
              window.open('https://github.com/sponsors/CanadaHonk'); // Open GitHub Sponsors link in user's browser

              onClose();
            }
          }, 'Sponsor'),

          React.createElement(Button, {
            color: ButtonClasses.colorPrimary,
            look: ButtonClasses.lookLink,

            type: 'button',

            onClick: () => {
              onClose();
            }
          }, 'Close')
        )
      )
    )

    return res;
  });

  const { openModal } = goosemodScope.webpackModules.findByProps('openModal', 'updateModal');

  openModal((e) => React.createElement(parent.default, { ...e }));
};

const badgeUsers = {
  sponsor: [ // People sponsoring (donating money) to GooseMod / Ducko
    '506482395269169153', // Ducko
    '597905003717459968', // creatable
    '405400327370571786', // Chix
    '707309693449535599', // Armagan
    '302734867425132545', // hax4dayz
    '557429876618166283', // sourTaste000
    '250353310698176522', // p.marg
    '301088721984552961', // overheremedia / jakefaith
    '700698485560705084', // debugproto
    '274209973196816385', // quagsirus
    '274926795285987328', // Apollo
    '293094733159333889', // b1sergiu
    '202740603790819328', // Snow Fox / Lisa
    '541210648982585354', // Heli / heli_is_for_noob
  ],

  dev: [ // People actively developing GooseMod itself
    '506482395269169153', // Ducko
  ],

  translator: [ // People who have translated GooseMod to other languages
  ]
};

export const addBadges = () => {
  unpatchers.push(
    // User badges
    goosemodScope.patcher.userBadges.patch('#badges.sponsor#',
      'https://goosemod.com/img/goose_gold.jpg',

      // Force check via query because Discord not properly rerendering
      () => goosemodScope.settings.gmSettings.gmBadges ? badgeUsers.sponsor : [],

      () => {
        showSponsorModal();
      },

      { round: true }
    ),

    goosemodScope.patcher.userBadges.patch('#badges.translator#',
      'https://goosemod.com/img/goose_globe.png',

      // Force check via query because Discord not properly rerendering
      () => goosemodScope.settings.gmSettings.gmBadges ? badgeUsers.translator : [],

      () => {
        
      },

      { round: true }
    ),

    goosemodScope.patcher.userBadges.patch('#badges.developer#',
      'https://goosemod.com/img/goose_glitch.jpg',

      // Force check via query because Discord not properly rerendering
      () => goosemodScope.settings.gmSettings.gmBadges ? badgeUsers.dev : [],

      () => {
        
      },

      { round: true }
    ),

    // Guild badges
    goosemod.patcher.guildBadges.patch('#badges.guild#',
      'https://goosemod.com/img/logo.jpg',
    
      // Force check via query because Discord not properly rerendering
      () => goosemodScope.settings.gmSettings.gmBadges ? ['756146058320674998'] : [],
    
      () => {

      },
    
      { round: true }
    )
  );
};

export const removeBadges = () => {
  for (const unpatch of unpatchers) {
    unpatch();
  }
};