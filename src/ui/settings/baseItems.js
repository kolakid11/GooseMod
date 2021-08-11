import * as GoosemodChangelog from '../goosemodChangelog';

export default (goosemodScope, gmSettings, Items) => {
  let oldItems = goosemodScope.settings.items;
  goosemodScope.settings.items = [];

  goosemodScope.settings.createHeading('GooseMod');

  const changeSetting = async (key, value) => {
    switch (key) {
      case 'changelog': {
        if (value) {
          const items = [
            ['item', '#terms.changelog#', [''], async () => {
              GoosemodChangelog.show();
            }, false]
          ];

          if (gmSettings.get().separators) items.unshift(['separator']);

          goosemodScope.settings.items.splice(goosemodScope.settings.items.indexOf(goosemodScope.settings.items.find(x => x[1] === 'Themes')) + 1, 0,
            ...items
          );
        } else {
          goosemodScope.settings.items.splice(goosemodScope.settings.items.indexOf(goosemodScope.settings.items.find(x => x[1] === 'Change Log')), gmSettings.get().separators ? 2 : 1);
        }

        await goosemodScope.settings.reopenSettings();
        goosemodScope.settings.openSettingItem('Settings');

        break;
      }

      case 'devchannel': {
        if (value) {
          goosemod.storage.set('goosemodUntetheredBranch', 'dev');
        } else {
          goosemod.storage.remove('goosemodUntetheredBranch');
        }

        break;
      }

      case 'separators': {
        if (value) {
          if (!gmSettings.get().home) goosemod.settings.items.splice(2, 0, ['separator']);
          if (gmSettings.get().changelog) goosemod.settings.items.splice(4, 0, ['separator']);
        } else {
          let main = true;

          goosemodScope.settings.items = goosemodScope.settings.items.filter((x, i) => {
            if (goosemodScope.settings.items[i + 1] && goosemodScope.settings.items[i + 1][1] && goosemodScope.settings.items[i + 1][1] === '#terms.goosemod.modules#') main = false;

            return !(x[0] === 'separator' && main);
          });
        }

        await goosemodScope.settings.reopenSettings();
        goosemodScope.settings.openSettingItem('Settings');

        break;
      }

      case 'gmBadges': {
        goosemodScope.gmBadges[value ? 'addBadges' : 'removeBadges']();

        break;
      }
    }

    gmSettings.set(key, value);
  };

  const refreshPrompt = async () => {
    if (await goosemodScope.confirmDialog('Refresh', 'Refresh Required', 'This setting **requires a refresh to take effect**. You **may experience some strange behaviour** in this session before refreshing.')) {
      location.reload();
    }
  };

  let settingDebugShowing = false;

  goosemodScope.settings.createItem('#terms.settings#', ['',
    {
      type: 'header',
      text: '#terms.settings#'
    },

    {
      type: 'toggle',

      text: '#settings.items.goosemod_change_log.title#',
      subtext: '#settings.items.goosemod_change_log.note#',

      onToggle: (c) => changeSetting('changelog', c),
      isToggled: () => gmSettings.get().changelog
    },

    {
      type: 'toggle',

      text: '#settings.items.main_separators.title#',
      subtext: '#settings.items.main_separators.note#',

      onToggle: (c) => changeSetting('separators', c),
      isToggled: () => gmSettings.get().separators
    },

    {
      type: 'toggle',

      text: '#settings.items.store_in_home.title#',
      subtext: '#settings.items.store_in_home.note#',

      onToggle: (c) => {
        changeSetting('home', c);
        refreshPrompt();
      },
      isToggled: () => gmSettings.get().home
    },

    {
      type: 'header',
      text: '#terms.store.store#'
    },

    {
      type: 'toggle',

      text: '#settings.items.auto_update.title#',
      subtext: '#settings.items.auto_update.note#',

      onToggle: (c) => changeSetting('autoupdate', c),
      isToggled: () => gmSettings.get().autoupdate
    },

    {
      type: 'header',
      text: '#settings.items.headers.appearance#'
    },

    {
      type: 'toggle',

      text: '#settings.items.goosemod_badges.title#',
      subtext: '#settings.items.goosemod_badges.note#',

      onToggle: (c) => changeSetting('gmBadges', c),
      isToggled: () => gmSettings.get().gmBadges
    },

    {
      type: 'header',
      text: '#settings.items.headers.utilities#'
    },

    {
      type: 'text-and-button',

      text: '#settings.items.purge_caches.title#',
      subtext: '#settings.items.purge_caches.note#',
      buttonText: '#settings.items.purge_caches.button#',

      onclick: async () => {
        // Like remove's dynamic local storage removal, but only remove GooseMod keys with "Cache" in 
        goosemod.storage.keys().filter((x) => x.toLowerCase().startsWith('goosemod') && x.includes('Cache')).forEach((x) => goosemod.storage.remove(x));

        refreshPrompt();
      }
    },

    {
      type: 'text-and-button',

      text: '#settings.items.start_tour.title#',
      subtext: '#settings.items.start_tour.note#',
      buttonText: '#settings.items.start_tour.button#',

      onclick: async () => {
        document.querySelector('.closeButton-1tv5uR').click(); // Close settings

        goosemodScope.ootb.start();
      }
    },

    {
      type: 'text-and-button',

      text: '#settings.items.copy_debug_info.title#',
      subtext: '#settings.items.copy_debug_info.note#',
      buttonText: '#settings.items.copy_debug_info.button#',

      onclick: async () => {
        const { copy } = goosemodScope.webpackModules.findByProps('copy', 'SUPPORTS_COPY');

        const mods = {
          powercord: 'powercord',
          vizality: 'vizality',
          ED: 'enhanceddiscord',
          BdApi: 'betterdiscord'
        };

        copy(`Discord:
Client: ${window.DiscordNative ? 'desktop' : 'web'}
User Agent: ${navigator.userAgent}
Release Channel: ${GLOBAL_ENV.RELEASE_CHANNEL}
Other Mods: ${Object.keys(mods).filter((x) => Object.keys(window).includes(x)).map((x) => mods[x]).join(', ')}

GooseMod:
GM Version: ${goosemodScope.versioning.version} (${goosemodScope.versioning.hash})
GM Branch: ${goosemodScope.storage.get('goosemodUntetheredBranch')}
GM Extension Version: ${window.gmExtension}
GM Storage Impl: ${goosemodScope.storage.type}
Modules: ${Object.keys(goosemodScope.modules).join(', ')}
`);
      }
    },

    {
      type: 'text-and-danger-button',
      
      text: '#settings.items.reset_goosemod.title#',
      subtext: '#settings.items.reset_goosemod.note#',
      buttonText: '#settings.items.reset_goosemod.button#',

      onclick: async () => {
        if (await goosemodScope.confirmDialog('Reset', 'Reset GooseMod', 'Confirming will completely reset GooseMod, removing all preferences and modules; as if you had installed GooseMod for the first time. This is irreversible.')) {
          goosemodScope.remove();
          window.location.reload();
        }
      }
    },

    {
      type: 'header',
      text: '#settings.items.headers.backup#'
    },

    {
      type: 'text-and-button',

      text: '#settings.items.create_backup.title#',
      subtext: '#settings.items.create_backup.note#',
      buttonText: '#settings.items.create_backup.button#',

      onclick: () => {
        const obj = goosemod.storage.keys().filter((x) => x.toLowerCase().startsWith('goosemod') && !x.includes('Cache')).reduce((acc, k) => {
          acc[k] = goosemod.storage.get(k);
          return acc;
        }, {});

        const toSave = JSON.stringify(obj);

        const el = document.createElement("a");
        el.style.display = 'none';

        const file = new Blob([ toSave ], { type: 'application/json' });

        el.href = URL.createObjectURL(file);
        el.download = `goosemodBackup.json`;

        document.body.appendChild(el);

        el.click();

        el.remove();
      }
    },

    {
      type: 'text-and-button',

      text: '#settings.items.restore_backup.title#',
      subtext: '#settings.items.restore_backup.note#',
      buttonText: '#settings.items.restore_backup.button#',

      onclick: async () => {
        const el = document.createElement('input');
        el.style.display = 'none';
        el.type = 'file';

        el.click();

        await new Promise((res) => { el.onchange = () => { res(); }; });
        
        const file = el.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
          const obj = JSON.parse(reader.result);

          for (const k in obj) {
            if (!k.startsWith('goosemod')) continue; // Don't set if not goosemod key for some security

            goosemod.storage.set(k, obj[k]);
          }

          location.reload();
        };

        reader.readAsText(file);
      }
    },

    {
      type: 'header',
      text: '#settings.items.headers.experimental#',
      // experimental: true
    },

    {
      type: 'subtext',
      text: '#settings.items.subtexts.experimental_warning#'
    },

    {
      type: 'toggle',

      experimental: true,
      text: '#settings.items.development_channel.title#',
      subtext: '#settings.items.development_channel.note#',

      onToggle: (c) => {
        changeSetting('devchannel', c);
        refreshPrompt();
      },
      isToggled: () => goosemod.storage.get('goosemodUntetheredBranch') === 'dev'
    },

    {
      type: 'toggle',

      experimental: true,
      text: '#settings.items.data_attributes.title#',
      subtext: '#settings.items.data_attributes.note#',

      onToggle: (c) => {
        changeSetting('attrs', c);
        refreshPrompt();
      },
      isToggled: () => gmSettings.get().attrs
    },

    {
      type: 'toggle',

      experimental: true,
      text: '#settings.items.snippets.title#',
      subtext: '#settings.items.snippets.note#',

      onToggle: (c) => {
        changeSetting('snippets', c);
        refreshPrompt();
      },
      isToggled: () => gmSettings.get().snippets
    },

    {
      type: 'toggle',

      experimental: true,
      text: '#settings.items.force_theme_settings.title#',
      subtext: '#settings.items.force_theme_settings.note#',

      onToggle: (c) => {
        changeSetting('allThemeSettings', c);
        refreshPrompt();
      },
      isToggled: () => gmSettings.get().allThemeSettings
    },

    /* {
      type: 'header',
      text: 'Debug',
      experimental: true
    },

    {
      type: 'toggle',

      debug: true,
      text: 'Add Debug Setting',
      subtext: 'Shows debug setting to test settings (per session, refresh to remove)',

      onToggle: () => {
        settingDebugShowing = true;

        goosemodScope.settings.createItem('Debug', ['',
          ...Object.keys(Items).filter((x) => x !== 'card').map((x) => ({
            type: x,

            text: x,
            label: x,

            subtext: 'subtext',

            buttonText: 'button text',
            placeholder: 'placeholder',

            initialValue: () => 'value',
            options: ['option 1', 'option 2', 'option 3'],
            isToggled: () => true,

            sort: () => 0,

            element: () => {
              const el = document.createElement('div');
              el.textContent = 'element text content';
              return el;
            }
          }))
        ]);
      },
      isToggled: () => settingDebugShowing,
      disabled: () => settingDebugShowing
    },

    {
      type: 'toggle',

      debug: true,
      text: 'Show Debug Toasts',
      subtext: 'Shows some debug toasts on some events',

      onToggle: (c) => changeSetting('debugToasts', c),
      isToggled: () => gmSettings.get().debugToasts
    }, */

    { type: 'gm-footer' }
  ]);

  if (gmSettings.get().separators && !gmSettings.get().home) goosemodScope.settings.createSeparator();

  let sortedVal = '#store.options.sort.stars#';
  let authorVal = '#store.options.author.all#';
  let searchQuery = '';

  const updateModuleStoreUI = () => {
    const cards = document.querySelectorAll(':not(.gm-store-category) > div > .gm-store-card');

    const fuzzyReg = new RegExp(`.*${searchQuery}.*`, 'i');

    let importedVal = document.querySelector('.selected-3s45Ha').textContent;
    if (importedVal !== '#store.options.tabs.store#' && importedVal !== '#store.options.tabs.imported#') importedVal = '#store.options.tabs.store#';

    for (let c of cards) {
      const titles = c.getElementsByClassName('title-31JmR4');

      const title = titles[1];

      const authors = [...titles[0].getElementsByClassName('author')].map((x) => x.textContent.split('#')[0]);
      const name = title.childNodes[0].wholeText;

      const description = c.getElementsByClassName('description-3_Ncsb')[0].innerText;

      const matches = (fuzzyReg.test(name) || fuzzyReg.test(description));

      const importedSelector = !c.getElementsByClassName('container-3auIfb')[0].classList.contains('hide-toggle') ? '#store.options.tabs.imported#' : '#store.options.tabs.store#';

      // const tags = [...c.classList].map((t) => t.replace(/\|/g, ' ').toLowerCase());

      switch (sortedVal) {
        case '#store.options.sort.az#': { // Already pre-sorted to A-Z
          c.style.order = '';

          break;
        }

        case '#store.options.sort.last_updated#': {
          const module = goosemodScope.moduleStoreAPI.modules.find((x) => x.name === name.trim());

          c.style.order = 3000000000 - module.lastUpdated;

          break;
        }

        case '#store.options.sort.stars#': {
          c.style.order = 10000 - parseInt(c.children[4].children[0].children[0].textContent);

          break;
        }
      }

      c.style.display = matches
        && (importedVal === '#store.options.tabs.store#' || importedVal === importedSelector)
        && (authorVal === '#store.options.author.all#' || authors.includes(authorVal.split(' (').slice(0, -1).join(' (')))
        ? 'block' : 'none';
    }

    const noInput = searchQuery === '' && importedVal === '#store.options.tabs.store#' && authorVal === '#store.options.author.all#';

    [...document.getElementsByClassName('gm-store-category')].forEach((x) => x.style.display = noInput ? 'block' : 'none');

    // Keep all header but make height 0 so it breaks flex row
    const allHeader = document.querySelector(':not(.gm-store-category) > .gm-store-header');

    allHeader.style.height = !noInput ? '0px' : '';
    allHeader.style.opacity = !noInput ? '0' : '';
    allHeader.style.margin = !noInput ? '0' : '';
  };

  goosemodScope.settings.updateModuleStoreUI = updateModuleStoreUI;

  const genCurrentDate = new Date();

  const upcomingVal = (x) => {
    const daysSinceUpdate = (genCurrentDate - (x.lastUpdated * 1000)) / 1000 / 60 / 60 / 24;

    return (x.github.stars / daysSinceUpdate) - (x.github.stars / 2) + (1 - daysSinceUpdate);
  };

  ['#terms.store.plugins#', '#terms.store.themes#'].forEach((x, i) => goosemodScope.settings.createItem(x, ['',
    {
      type: 'search',

      placeholder: i === 0 ? '#store.options.search.placeholder.plugins#' : '#store.options.search.placeholder.themes#',

      onchange: (query) => {
        searchQuery = query;

        updateModuleStoreUI();
      },

      storeSpecific: true
    },

    {
      type: 'dropdown-individual',

      label: '#store.options.sort.label#',

      options: [
        '#store.options.sort.stars#',
        '#store.options.sort.az#',
        '#store.options.sort.last_updated#'
      ],

      onchange: (val) => {
        sortedVal = val;

        updateModuleStoreUI();
      }
    },

    {
      type: 'dropdown-individual',

      label: '#store.options.author.label#',

      options: () => {
        const idCache = goosemodScope.moduleStoreAPI.idCache.getCache();

        const authors = [...goosemodScope.moduleStoreAPI.modules.reduce((acc, x) => {
          let authors = x.authors;

          if (!Array.isArray(authors)) authors = [ authors ];

          for (const a of authors) {
            let key = a;

            if (typeof a === 'object') {
              key = a.n;
            } else if (a.match(/^[0-9]{17,18}$/)) {
              key = idCache[a]?.data?.username;
            } else {
              const idMatch = a.match(/(.*) \(([0-9]{17,18})\)/); // "<name> (<id>)"

              if (idMatch !== null) {
                key = idMatch[1];
              }
            }

            if (!key) continue;

            acc.set(key, (acc.get(key) || 0) + 1);
          }

          return acc;
        }, new Map()).entries()].sort((a, b) => b[1] - a[1]).map((x) => `${x[0]} (${x[1]})`);

        authors.unshift('#store.options.author.all#');
        
        return authors;
      },

      onchange: (val) => {
        authorVal = val;

        updateModuleStoreUI();
      }
    },

    {
      type: 'store-category',
      text: '#store.categories.top_starred#',
      sort: (a, b) => b.github.stars - a.github.stars
    },

    {
      type: 'store-category',
      text: '#store.categories.recently_updated#',
      sort: (a, b) => b.lastUpdated - a.lastUpdated
    },

    {
      type: 'store-category',
      text: '#store.categories.upcoming#',
      sort: (a, b) => upcomingVal(b) - upcomingVal(a)
    },

    {
      type: 'store-header',
      text: i === 0 ? '#store.categories.all.plugins#' : '#store.categories.all.themes#'
    },

    { type: 'gm-footer' }
  ]));

  goosemodScope.settings.createItem('#terms.store.snippets#', ['',
    {
      type: 'search',

      placeholder: 'Search Snippets',

      onchange: (query) => {
        const cards = document.getElementsByClassName('gm-store-card');

        const fuzzyReg = new RegExp(`.*${query}.*`, 'i');

        for (const c of cards) {
          const description = c.getElementsByClassName('markdown-11q6EU')[0].textContent;

          const matches = (fuzzyReg.test(description));

          c.style.display = matches ? '' : 'none';
        }
      },

      storeSpecific: true
    }
  ]);

  if (gmSettings.get().changelog) {
    if (gmSettings.get().separators) goosemodScope.settings.createSeparator();

    goosemodScope.settings.createItem('#terms.changelog#', [""], async () => {
      GoosemodChangelog.show();
    });
  }

  goosemodScope.settings.createSeparator();

  goosemodScope.settings.createHeading('#terms.goosemod.modules#');

  goosemodScope.settings.items = goosemodScope.settings.items.concat(oldItems);
};