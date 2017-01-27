(function () {
  angular.module('angularytics', []).provider('Angularytics', function () {
    var eventHandlersNames = ['Google'];
    this.setEventHandlers = function (handlers) {
      if (angular.isString(handlers)) {
        handlers = [handlers];
      }
      eventHandlersNames = [];
      angular.forEach(handlers, function (handler) {
        eventHandlersNames.push(capitalizeHandler(handler));
      });
    };
    var capitalizeHandler = function (handler) {
      return handler.charAt(0).toUpperCase() + handler.substring(1);
    };
    var pageChangeEvent = '$locationChangeSuccess';
    this.setPageChangeEvent = function (newPageChangeEvent) {
      pageChangeEvent = newPageChangeEvent;
    };
    this.$get = [
      '$injector',
      '$rootScope',
      '$location',
      function ($injector, $rootScope, $location) {
        var eventHandlers = [];
        angular.forEach(eventHandlersNames, function (handler) {
          eventHandlers.push($injector.get('Angularytics' + handler + 'Handler'));
        });
        var forEachHandlerDo = function (action) {
          angular.forEach(eventHandlers, function (handler) {
            action(handler);
          });
        };
        var service = {};
        service.init = function () {
        };
        service.trackEvent = function (category, action, opt_label, opt_value, opt_noninteraction) {
          forEachHandlerDo(function (handler) {
            if (category && action) {
              handler.trackEvent(category, action, opt_label, opt_value, opt_noninteraction);
            }
          });
        };
        service.trackPageView = function (url) {
          forEachHandlerDo(function (handler) {
            if (url) {
              handler.trackPageView(url);
            }
          });
        };
        service.trackTiming = function (category, variable, value, opt_label) {
          forEachHandlerDo(function (handler) {
            if (category && variable && value) {
              handler.trackTiming(category, variable, value, opt_label);
            }
          });
        };
        $rootScope.$on(pageChangeEvent, function () {
          service.trackPageView($location.url());
        });
        return service;
      }
    ];
  });
}());
(function () {
  angular.module('angularytics').factory('AngularyticsConsoleHandler', [
    '$log',
    function ($log) {
      var service = {};
      service.trackPageView = function (url) {
        $log.log('URL visited', url);
      };
      service.trackEvent = function (category, action, opt_label, opt_value, opt_noninteraction) {
        $log.log('Event tracked', category, action, opt_label, opt_value, opt_noninteraction);
      };
      service.trackTiming = function (category, variable, value, opt_label) {
        $log.log('Timing tracked', category, variable, value, opt_label);
      };
      return service;
    }
  ]);
}());
(function () {
  angular.module('angularytics').factory('AngularyticsGoogleHandler', function () {
    var service = {};
    service.trackPageView = function (url) {
      _gaq.push([
        '_set',
        'page',
        url
      ]);
      _gaq.push([
        '_trackPageview',
        url
      ]);
    };
    service.trackEvent = function (category, action, opt_label, opt_value, opt_noninteraction) {
      _gaq.push([
        '_trackEvent',
        category,
        action,
        opt_label,
        opt_value,
        opt_noninteraction
      ]);
    };
    service.trackTiming = function (category, variable, value, opt_label) {
      _gaq.push([
        '_trackTiming',
        category,
        variable,
        value,
        opt_label
      ]);
    };
    return service;
  }).factory('AngularyticsGoogleUniversalHandler', function () {
    var service = {};
    service.trackPageView = function (url) {
      ga('set', 'page', url);
      ga('send', 'pageview', url);
    };
    service.trackEvent = function (category, action, opt_label, opt_value, opt_noninteraction) {
      ga('send', 'event', category, action, opt_label, opt_value, { 'nonInteraction': opt_noninteraction });
    };
    service.trackTiming = function (category, variable, value, opt_label) {
      ga('send', 'timing', category, variable, value, opt_label);
    };
    return service;
  });
}());
(function () {
  angular.module('angularytics').filter('trackEvent', [
    'Angularytics',
    function (Angularytics) {
      return function (entry, category, action, opt_label, opt_value, opt_noninteraction) {
        Angularytics.trackEvent(category, action, opt_label, opt_value, opt_noninteraction);
        return entry;
      };
    }
  ]);
}());
angular.module('docsApp', [ 'angularytics', 'ngRoute', 'ngMessages', 'ngMaterial' ], [
  'SERVICES',
  'COMPONENTS',
  'DEMOS',
  'PAGES',
  '$routeProvider',
  '$locationProvider',
  '$mdThemingProvider',
  '$mdIconProvider',
function(SERVICES, COMPONENTS, DEMOS, PAGES,
    $routeProvider, $locationProvider, $mdThemingProvider, $mdIconProvider) {

  $locationProvider.html5Mode(true);

  $routeProvider
    .when('/', {
      templateUrl: 'partials/home.tmpl.html'
    })
    .when('/layout/:tmpl', {
      templateUrl: function(params){
        return 'partials/layout-' + params.tmpl + '.tmpl.html';
      }
    })
    .when('/layout/', {
      redirectTo:  '/layout/introduction'
    })
    .when('/demo/', {
      redirectTo: DEMOS[0].url
    })
    .when('/api/', {
      redirectTo: COMPONENTS[0].docs[0].url
    })
    .when('/getting-started', {
      templateUrl: 'partials/getting-started.tmpl.html'
    })
    .when('/contributors', {
      templateUrl: 'partials/contributors.tmpl.html'
    })
    .when('/license', {
      templateUrl: 'partials/license.tmpl.html'
    });
  $mdThemingProvider.definePalette('docs-blue', $mdThemingProvider.extendPalette('blue', {
    '50': '#DCEFFF',
    '100': '#AAD1F9',
    '200': '#7BB8F5',
    '300': '#4C9EF1',
    '400': '#1C85ED',
    '500': '#106CC8',
    '600': '#0159A2',
    '700': '#025EE9',
    '800': '#014AB6',
    '900': '#013583',
    'contrastDefaultColor': 'light',
    'contrastDarkColors': '50 100 200 A100',
    'contrastStrongLightColors': '300 400 A200 A400'
  }));
  $mdThemingProvider.definePalette('docs-red', $mdThemingProvider.extendPalette('red', {
    'A100': '#DE3641'
  }));

  $mdThemingProvider.theme('docs-dark', 'default')
    .primaryPalette('yellow')
    .dark();

  $mdIconProvider.icon('md-toggle-arrow', 'img/icons/toggle-arrow.svg', 48);

  $mdThemingProvider.theme('default')
      .primaryPalette('docs-blue')
      .accentPalette('docs-red');

  $mdThemingProvider
      .enableBrowserColor();

  angular.forEach(PAGES, function(pages, area) {
    angular.forEach(pages, function(page) {
      $routeProvider
        .when(page.url, {
          templateUrl: page.outputPath,
          controller: 'GuideCtrl'
        });
    });
  });

  angular.forEach(COMPONENTS, function(component) {
    angular.forEach(component.docs, function(doc) {
      $routeProvider.when('/' + doc.url, {
        templateUrl: doc.outputPath,
        resolve: {
          component: function() { return component; },
          doc: function() { return doc; }
        },
        controller: 'ComponentDocCtrl'
      });
    });
  });

  angular.forEach(SERVICES, function(service) {
    $routeProvider.when('/' + service.url, {
      templateUrl: service.outputPath,
      resolve: {
        component: function() { return { isService: true } },
        doc: function() { return service; }
      },
      controller: 'ComponentDocCtrl'
    });
  });

  angular.forEach(DEMOS, function(componentDemos) {
    var demoComponent;

    COMPONENTS.forEach(function(component) {
      if (componentDemos.moduleName === component.name) {
        demoComponent = component;
        component.demoUrl = componentDemos.url;
      }
    });

    demoComponent = demoComponent || angular.extend({}, componentDemos);
    $routeProvider.when('/' + componentDemos.url, {
      templateUrl: 'partials/demo.tmpl.html',
      controller: 'DemoCtrl',
      resolve: {
        component: function() { return demoComponent; },
        demos: function() { return componentDemos.demos; }
      }
    });
  });

  $routeProvider.otherwise('/');

  // Change hash prefix of the Angular router, because we use the hash symbol for anchor links.
  // The hash will be not used by the docs, because we use the HTML5 mode for our links.
  $locationProvider.hashPrefix('!');

}])

.config(['AngularyticsProvider', function(AngularyticsProvider) {
   AngularyticsProvider.setEventHandlers(['Console', 'GoogleUniversal']);
}])

.run(['Angularytics', function(Angularytics) {
  Angularytics.init();
}])

.factory('menu', [
  'SERVICES',
  'COMPONENTS',
  'DEMOS',
  'PAGES',
  '$location',
  '$rootScope',
  '$http',
  '$window',
function(SERVICES, COMPONENTS, DEMOS, PAGES, $location, $rootScope, $http, $window) {

  var version = {};

  var sections = [{
    name: 'Getting Started',
    url: 'getting-started',
    type: 'link'
  }];

  var demoDocs = [];
  angular.forEach(DEMOS, function(componentDemos) {
    demoDocs.push({
      name: componentDemos.label,
      url: componentDemos.url
    });
  });

  sections.push({
    name: 'Demos',
    pages: demoDocs.sort(sortByName),
    type: 'toggle'
  });

  sections.push();

  sections.push({
    name: 'Customization',
    type: 'heading',
    children: [
      {
        name: 'CSS',
        type: 'toggle',
        pages: [{
            name: 'Typography',
            url: 'CSS/typography',
            type: 'link'
          },
          {
            name : 'Button',
            url: 'CSS/button',
            type: 'link'
          },
          {
            name : 'Checkbox',
            url: 'CSS/checkbox',
            type: 'link'
          }]
      },
      {
        name: 'Theming',
        type: 'toggle',
        pages: [
          {
            name: 'Introduction and Terms',
            url: 'Theming/01_introduction',
            type: 'link'
          },
          {
            name: 'Declarative Syntax',
            url: 'Theming/02_declarative_syntax',
            type: 'link'
          },
          {
            name: 'Configuring a Theme',
            url: 'Theming/03_configuring_a_theme',
            type: 'link'
          },
          {
            name: 'Multiple Themes',
            url: 'Theming/04_multiple_themes',
            type: 'link'
          },
          {
            name: 'Under the Hood',
            url: 'Theming/05_under_the_hood',
            type: 'link'
          },
          {
            name: 'Browser Color',
            url: 'Theming/06_browser_color',
            type: 'link'
          }
        ]
      }
    ]
  });

  var docsByModule = {};
  var apiDocs = {};
  COMPONENTS.forEach(function(component) {
    component.docs.forEach(function(doc) {
      if (angular.isDefined(doc.private)) return;
      apiDocs[doc.type] = apiDocs[doc.type] || [];
      apiDocs[doc.type].push(doc);

      docsByModule[doc.module] = docsByModule[doc.module] || [];
      docsByModule[doc.module].push(doc);
    });
  });

  SERVICES.forEach(function(service) {
    if (angular.isDefined(service.private)) return;
    apiDocs[service.type] = apiDocs[service.type] || [];
    apiDocs[service.type].push(service);

    docsByModule[service.module] = docsByModule[service.module] || [];
    docsByModule[service.module].push(service);
  });

  sections.push({
    name: 'API Reference',
    type: 'heading',
    children: [
    {
      name: 'Layout',
      type: 'toggle',
      pages: [{
        name: 'Introduction',
        id: 'layoutIntro',
        url: 'layout/introduction'
      }
        ,{
        name: 'Layout Containers',
        id: 'layoutContainers',
        url: 'layout/container'
        }
      ,{
        name: 'Layout Children',
        id: 'layoutGrid',
        url: 'layout/children'
      }
      ,{
        name: 'Child Alignment',
        id: 'layoutAlign',
        url: 'layout/alignment'
      }
      ,{
        name: 'Extra Options',
        id: 'layoutOptions',
        url: 'layout/options'
      }
      ,{
        name: 'Troubleshooting',
        id: 'layoutTips',
        url: 'layout/tips'
      }]
    },
    {
      name: 'Services',
      pages: apiDocs.service.sort(sortByName),
      type: 'toggle'
    },{
      name: 'Types',
      pages: apiDocs.type.sort(sortByName),
      type: 'toggle'
    },{
      name: 'Directives',
      pages: apiDocs.directive.sort(sortByName),
      type: 'toggle'
    }]
  });

  sections.push( {
        name: 'Contributors',
        url: 'contributors',
        type: 'link'
      } );

  sections.push({
    name: 'License',
    url:  'license',
    type: 'link',

    // Add a hidden section so that the title in the toolbar is properly set
    hidden: true
  });

  function sortByName(a,b) {
    return a.name < b.name ? -1 : 1;
  }

  var self;

  $rootScope.$on('$locationChangeSuccess', onLocationChange);

  $http.get("/docs.json")
      .then(function(response) {
        var versionId = getVersionIdFromPath();
        var head = { type: 'version', url: '/HEAD', id: 'head', name: 'HEAD (master)', github: '' };
        var commonVersions = versionId === 'head' ? [] : [ head ];
        var knownVersions = getAllVersions();
        var listVersions = knownVersions.filter(removeCurrentVersion);
        var currentVersion = getCurrentVersion() || {name: 'local'};
        version.current = currentVersion;
        sections.unshift({
          name: 'Documentation Version',
          type: 'heading',
          className: 'version-picker',
          children: [ {
            name: currentVersion.name,
            type: 'toggle',
            pages: commonVersions.concat(listVersions)
          } ]
        });
        function removeCurrentVersion (version) {
          switch (versionId) {
            case version.id: return false;
            case 'latest': return !version.latest;
            default: return true;
          }
        }
        function getAllVersions () {
          if (response && response.versions && response.versions.length) {
            return response.versions.map(function(version) {
              var latest = response.latest === version;
              return {
                type: 'version',
                url: '/' + version,
                name: getVersionFullString({ id: version, latest: latest }),
                id: version,
                latest: latest,
                github: 'tree/v' + version
              };
            });
          }

          return [];
        }
        function getVersionFullString (version) {
          return version.latest
              ? 'Latest Release (' + version.id + ')'
              : 'Release ' + version.id;
        }
        function getCurrentVersion () {
          switch (versionId) {
            case 'head': return head;
            case 'latest': return knownVersions.filter(getLatest)[0];
            default: return knownVersions.filter(getVersion)[0];
          }
          function getLatest (version) { return version.latest; }
          function getVersion (version) { return versionId === version.id; }
        }
        function getVersionIdFromPath () {
          var path = $window.location.pathname;
          if (path.length < 2) path = 'HEAD';
          return path.match(/[^\/]+/)[0].toLowerCase();
        }
      });

  return self = {
    version:  version,
    sections: sections,

    selectSection: function(section) {
      self.openedSection = section;
    },
    toggleSelectSection: function(section) {
      self.openedSection = (self.openedSection === section ? null : section);
    },
    isSectionSelected: function(section) {
      return self.openedSection === section;
    },

    selectPage: function(section, page) {
      self.currentSection = section;
      self.currentPage = page;
    },
    isPageSelected: function(page) {
      return self.currentPage === page;
    }
  };

  function onLocationChange() {
    var path = $location.path();
    var introLink = {
      name: "Introduction",
      url:  "/",
      type: "link"
    };

    if (path == '/') {
      self.selectSection(introLink);
      self.selectPage(introLink, introLink);
      return;
    }

    var matchPage = function(section, page) {
      if (path.indexOf(page.url) !== -1) {
        self.selectSection(section);
        self.selectPage(section, page);
      }
    };

    sections.forEach(function(section) {
      if (section.children) {
        // matches nested section toggles, such as API or Customization
        section.children.forEach(function(childSection){
          if(childSection.pages){
            childSection.pages.forEach(function(page){
              matchPage(childSection, page);
            });
          }
        });
      }
      else if (section.pages) {
        // matches top-level section toggles, such as Demos
        section.pages.forEach(function(page) {
          matchPage(section, page);
        });
      }
      else if (section.type === 'link') {
        // matches top-level links, such as "Getting Started"
        matchPage(section, section);
      }
    });
  }
}])

.directive('menuLink', function() {
  return {
    scope: {
      section: '='
    },
    templateUrl: 'partials/menu-link.tmpl.html',
    link: function($scope, $element) {
      var controller = $element.parent().controller();

      $scope.isSelected = function() {
        return controller.isSelected($scope.section);
      };

      $scope.focusSection = function() {
        // set flag to be used later when
        // $locationChangeSuccess calls openPage()
        controller.autoFocusContent = true;
      };
    }
  };
})

.directive('menuToggle', ['$mdUtil', '$animateCss', '$$rAF', function($mdUtil, $animateCss, $$rAF) {
  return {
    scope: {
      section: '='
    },
    templateUrl: 'partials/menu-toggle.tmpl.html',
    link: function($scope, $element) {
      var controller = $element.parent().controller();

      // Used for toggling the visibility of the accordion's content, after
      // all of the animations are completed. This prevents users from being
      // allowed to tab through to the hidden content.
      $scope.renderContent = false;

      $scope.isOpen = function() {
        return controller.isOpen($scope.section);
      };

      $scope.toggle = function() {
        controller.toggleOpen($scope.section);
      };

      $mdUtil.nextTick(function() {
        $scope.$watch(function () {
          return controller.isOpen($scope.section);
        }, function (open) {
          var $ul = $element.find('ul');
          var $li = $ul[0].querySelector('a.active');

          if (open) {
            $scope.renderContent = true;
          }

          $$rAF(function() {
            var targetHeight = open ? $ul[0].scrollHeight : 0;

            $animateCss($ul, {
              easing: 'cubic-bezier(0.35, 0, 0.25, 1)',
              to: { height: targetHeight + 'px' },
              duration: 0.75 // seconds
            }).start().then(function() {
              var $li = $ul[0].querySelector('a.active');

              $scope.renderContent = open;

              if (open && $li && $ul[0].scrollTop === 0) {
                var activeHeight = $li.scrollHeight;
                var activeOffset = $li.offsetTop;
                var offsetParent = $li.offsetParent;
                var parentScrollPosition = offsetParent ? offsetParent.offsetTop : 0;

                // Reduce it a bit (2 list items' height worth) so it doesn't touch the nav
                var negativeOffset = activeHeight * 2;
                var newScrollTop = activeOffset + parentScrollPosition - negativeOffset;

                $mdUtil.animateScrollTo(document.querySelector('.docs-menu').parentNode, newScrollTop);
              }
            });
          });
        });
      });

      var parentNode = $element[0].parentNode.parentNode.parentNode;
      if(parentNode.classList.contains('parent-list-item')) {
        var heading = parentNode.querySelector('h2');
        $element[0].firstChild.setAttribute('aria-describedby', heading.id);
      }
    }
  };
}])

.controller('DocsCtrl', [
  '$scope',
  'COMPONENTS',
  'BUILDCONFIG',
  '$mdSidenav',
  '$timeout',
  '$mdDialog',
  'menu',
  '$location',
  '$rootScope',
  '$mdUtil',
function($scope, COMPONENTS, BUILDCONFIG, $mdSidenav, $timeout, $mdDialog, menu, $location, $rootScope, $mdUtil) {
  var self = this;

  $scope.COMPONENTS = COMPONENTS;
  $scope.BUILDCONFIG = BUILDCONFIG;
  $scope.menu = menu;

  $scope.path = path;
  $scope.goHome = goHome;
  $scope.openMenu = openMenu;
  $scope.closeMenu = closeMenu;
  $scope.isSectionSelected = isSectionSelected;
  $scope.scrollTop = scrollTop;

  // Grab the current year so we don't have to update the license every year
  $scope.thisYear = (new Date()).getFullYear();

  $rootScope.$on('$locationChangeSuccess', openPage);
  $scope.focusMainContent = focusMainContent;

  //-- Define a fake model for the related page selector
  Object.defineProperty($rootScope, "relatedPage", {
    get: function () { return null; },
    set: angular.noop,
    enumerable: true,
    configurable: true
  });

  $rootScope.redirectToUrl = function(url) {
    $location.path(url);
    $timeout(function () { $rootScope.relatedPage = null; }, 100);
  };

  // Methods used by menuLink and menuToggle directives
  this.isOpen = isOpen;
  this.isSelected = isSelected;
  this.toggleOpen = toggleOpen;
  this.autoFocusContent = false;


  var mainContentArea = document.querySelector("[role='main']");
  var scrollContentEl = mainContentArea.querySelector('md-content[md-scroll-y]');


  // *********************
  // Internal methods
  // *********************

  function closeMenu() {
    $timeout(function() { $mdSidenav('left').close(); });
  }

  function openMenu() {
    $timeout(function() { $mdSidenav('left').open(); });
  }

  function path() {
    return $location.path();
  }

  function scrollTop() {
    $mdUtil.animateScrollTo(scrollContentEl, 0, 200);
  }

  function goHome($event) {
    menu.selectPage(null, null);
    $location.path( '/' );
  }

  function openPage() {
    $scope.closeMenu();

    if (self.autoFocusContent) {
      focusMainContent();
      self.autoFocusContent = false;
    }
  }

  function focusMainContent($event) {
    // prevent skip link from redirecting
    if ($event) { $event.preventDefault(); }

    $timeout(function(){
      mainContentArea.focus();
    },90);

  }

  function isSelected(page) {
    return menu.isPageSelected(page);
  }

  function isSectionSelected(section) {
    var selected = false;
    var openedSection = menu.openedSection;
    if(openedSection === section){
      selected = true;
    }
    else if(section.children) {
      section.children.forEach(function(childSection) {
        if(childSection === openedSection){
          selected = true;
        }
      });
    }
    return selected;
  }

  function isOpen(section) {
    return menu.isSectionSelected(section);
  }

  function toggleOpen(section) {
    menu.toggleSelectSection(section);
  }
}])

.controller('HomeCtrl', [
  '$scope',
  '$rootScope',
function($scope, $rootScope) {
  $rootScope.currentComponent = $rootScope.currentDoc = null;
}])


.controller('GuideCtrl', [
  '$rootScope', '$http',
function($rootScope, $http) {
  $rootScope.currentComponent = $rootScope.currentDoc = null;
  if ( !$rootScope.contributors ) {
    $http
      .get('./contributors.json')
      .then(function(response) {
        $rootScope.github = response.data;
      })
  }
}])

.controller('LayoutCtrl', [
  '$scope',
  '$attrs',
  '$location',
  '$rootScope',
function($scope, $attrs, $location, $rootScope) {
  $rootScope.currentComponent = $rootScope.currentDoc = null;

  $scope.exampleNotEditable = true;
  $scope.layoutDemo = {
    mainAxis: 'center',
    crossAxis: 'center',
    direction: 'row'
  };
  $scope.layoutAlign = function() {
    return $scope.layoutDemo.mainAxis +
     ($scope.layoutDemo.crossAxis ? ' ' + $scope.layoutDemo.crossAxis : '')
  };
}])

.controller('LayoutTipsCtrl', [
function() {
  var self = this;

  /*
   * Flex Sizing - Odd
   */
  self.toggleButtonText = "Hide";

  self.toggleContentSize = function() {
    var contentEl = angular.element(document.getElementById('toHide'));

    contentEl.toggleClass("ng-hide");

    self.toggleButtonText = contentEl.hasClass("ng-hide") ? "Show" : "Hide";
  };
}])

.controller('ComponentDocCtrl', [
  '$scope',
  'doc',
  'component',
  '$rootScope',
function($scope, doc, component, $rootScope) {
  $rootScope.currentComponent = component;
  $rootScope.currentDoc = doc;
}])

.controller('DemoCtrl', [
  '$rootScope',
  '$scope',
  'component',
  'demos',
  '$templateRequest',
function($rootScope, $scope, component, demos, $templateRequest) {
  $rootScope.currentComponent = component;
  $rootScope.currentDoc = null;

  $scope.demos = [];

  angular.forEach(demos, function(demo) {
    // Get displayed contents (un-minified)
    var files = [demo.index]
      .concat(demo.js || [])
      .concat(demo.css || [])
      .concat(demo.html || []);
    files.forEach(function(file) {
      file.httpPromise = $templateRequest(file.outputPath)
        .then(function(response) {
          file.contents = response
            .replace('<head/>', '');
          return file.contents;
        });
    });
    demo.$files = files;
    $scope.demos.push(demo);
  });

  $scope.demos = $scope.demos.sort(function(a,b) {
    return a.name > b.name ? 1 : -1;
  });

}])

.filter('nospace', function () {
  return function (value) {
    return (!value) ? '' : value.replace(/ /g, '');
  };
})
.filter('humanizeDoc', function() {
  return function(doc) {
    if (!doc) return;
    if (doc.type === 'directive') {
      return doc.name.replace(/([A-Z])/g, function($1) {
        return '-'+$1.toLowerCase();
      });
    }
    return doc.label || doc.name;
  };
})

.filter('directiveBrackets', function() {
  return function(str, restrict) {
    if (restrict) {
      // If it is restricted to only attributes
      if (!restrict.element && restrict.attribute) {
        return '[' + str + ']';
      }

      // If it is restricted to elements and isn't a service
      if (restrict.element && str.indexOf('-') > -1) {
        return '<' + str + '>';
      }

      // TODO: Handle class/comment restrictions if we ever have any to document
    }

    // Just return the original string if we don't know what to do with it
    return str;
  };
})

/** Directive which applies a specified class to the element when being scrolled */
.directive('docsScrollClass', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attr) {

      var scrollParent = element.parent();
      var isScrolling = false;

      // Initial update of the state.
      updateState();

      // Register a scroll listener, which updates the state.
      scrollParent.on('scroll', updateState);

      function updateState() {
        var newState = scrollParent[0].scrollTop !== 0;

        if (newState !== isScrolling) {
          element.toggleClass(attr.docsScrollClass, newState);
        }

        isScrolling = newState;
      }
    }
  };
});

(function() {
  angular
    .module('docsApp')
    .directive('h4', MdAnchorDirective)
    .directive('h3', MdAnchorDirective)
    .directive('h2', MdAnchorDirective)
    .directive('h1', MdAnchorDirective);

  function MdAnchorDirective($mdUtil, $compile) {

    /** @const @type {RegExp} */
    var unsafeCharRegex = /[&\s+$,:;=?@"#{}|^~[`%!'\].\/()*\\]/g;

    return {
      restrict: 'E',
      scope: {},
      require: '^?mdContent',
      link: postLink
    };

    function postLink(scope, element, attr, ctrl) {

      // Only create anchors when being inside of a md-content.
      if (!ctrl) {
        return;
      }

      var anchorEl = $compile('<a class="docs-anchor" ng-href="#{{ name }}" name="{{ name }}"></a>')(scope);

      // Wrap contents inside of the anchor element.
      anchorEl.append(element.contents());

      // Append the anchor element to the directive element.
      element.append(anchorEl);

      // Delay the URL creation, because the inner text might be not interpolated yet.
      $mdUtil.nextTick(createContentURL);

      /**
       * Creates URL from the text content of the element and writes it into the scope.
       */
      function createContentURL() {
        scope.name = element.text()
          .trim()                           // Trim text due to browsers extra whitespace.
          .replace(/'/g, '')                // Transform apostrophes words to a single one.
          .replace(unsafeCharRegex, '-')    // Replace unsafe chars with a dash symbol.
          .replace(/-{2,}/g, '-')           // Remove repeating dash symbols.
          .replace(/^-|-$/g, '')            // Remove preceding or ending dashes.
          .toLowerCase();                   // Link should be lower-case for accessible URL.
      }
    }
  }

  // Manually specify $inject because Strict DI is enabled.
  MdAnchorDirective.$inject = ['$mdUtil', '$compile'];

})();
angular.module('docsApp').constant('BUILDCONFIG', {
  "ngVersion": "1.5.5",
  "version": "1.1.1",
  "repository": "https://github.com/angular/material",
  "commit": "38f5dcdbca13b2f7613f4f2f864bf37be7f6c9c3",
  "date": "2017-01-19 21:20:37 -0800"
});

(function() {
  angular.module('docsApp')
    .factory('codepenDataAdapter', CodepenDataAdapter)
    .factory('codepen', ['$demoAngularScripts', '$document', 'codepenDataAdapter', Codepen]);

  // Provides a service to open a code example in codepen.
  function Codepen($demoAngularScripts, $document, codepenDataAdapter) {

    // The following URL must be HTTP and not HTTPS to allow us to do localhost testing
    var CODEPEN_API = 'http://codepen.io/pen/define/';

    return {
      editOnCodepen: editOnCodepen
    };

    // Creates a codepen from the given demo model by posting to Codepen's API
    // using a hidden form.  The hidden form is necessary to avoid a CORS issue.
    // See http://blog.codepen.io/documentation/api/prefill
    function editOnCodepen(demo) {
      var data = codepenDataAdapter.translate(demo, $demoAngularScripts.all());
      var form = buildForm(data);
      $document.find('body').append(form);
      form[0].submit();
      form.remove();
    }

    // Builds a hidden form with data necessary to create a codepen.
    function buildForm(data) {
      var form = angular.element(
        '<form style="display: none;" method="post" target="_blank" action="' +
          CODEPEN_API +
          '"></form>'
      );
      var input = '<input type="hidden" name="data" value="' + escapeJsonQuotes(data) + '" />';
      form.append(input);
      return form;
    }

    // Recommended by Codepen to escape quotes.
    // See http://blog.codepen.io/documentation/api/prefill
    function escapeJsonQuotes(json) {
      return JSON.stringify(json)
        .replace(/'/g, "&amp;apos;")
        .replace(/"/g, "&amp;quot;")
        /**
         * Codepen was unescaping &lt; (<) and &gt; (>) which caused, on some demos,
         * an unclosed elements (like <md-select>). 
         * Used different unicode lookalike characters so it won't be considered as an element
         */
        .replace(/&amp;lt;/g, "&#x02C2;") // http://graphemica.com/%CB%82
        .replace(/&amp;gt;/g, "&#x02C3;"); // http://graphemica.com/%CB%83
    }
  }

  // Translates demo metadata and files into Codepen's post form data.  See api documentation for
  // additional fields not used by this service. http://blog.codepen.io/documentation/api/prefill
  function CodepenDataAdapter() {

    // The following URL's need to use `localhost` as these values get replaced during release
    var CORE_JS  = 'http://localhost:8080/angular-material.js';
    var CORE_CSS = 'http://localhost:8080/angular-material.css';
    var DOC_CSS  = 'http://localhost:8080/docs.css';              // CSS overrides for custom docs

    var LINK_FONTS_ROBOTO = '<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700,400italic">';

    var UNSECURE_CACHE_JS = 'http://ngmaterial.assets.s3.amazonaws.com/svg-assets-cache.js';
    var ASSET_CACHE_JS = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-114/svg-assets-cache.js';


    return {
      translate: translate
    };

    // Translates a demo model to match Codepen's post data
    // See http://blog.codepen.io/documentation/api/prefill
    function translate(demo, externalScripts) {
      var files = demo.files;

      return appendLicenses({
        title: demo.title,
        html: processHtml(demo),
        head: LINK_FONTS_ROBOTO,

        js: processJs(files.js),
        css: mergeFiles( files.css ).join(' '),

        js_external: externalScripts.concat([ASSET_CACHE_JS, CORE_JS]).join(';'),
        css_external: [CORE_CSS, DOC_CSS].join(';')
      });
    }

    // Modifies index.html with necessary changes in order to display correctly in codepen
    // See each processor to determine how each modifies the html
    function processHtml(demo) {

      var allContent = demo.files.index.contents;

      var processors = [
        applyAngularAttributesToParentElement,
        insertTemplatesAsScriptTags,
        htmlEscapeAmpersand
      ];

      processors.forEach(function(processor) {
        allContent = processor(allContent, demo);
      });

      return allContent;
    }

    /**
     * Append MIT License information to all CodePen source samples(HTML, JS, CSS)
     */
    function appendLicenses(data) {

      data.html = appendLicenseFor(data.html, 'html');
      data.js   = appendLicenseFor(data.js, 'js');
      data.css  = appendLicenseFor(data.css, 'css');

      function appendLicenseFor(content, lang) {
            var commentStart = '', commentEnd = '';

        switch(lang) {
          case 'html' : commentStart = '<!--'; commentEnd = '-->'; break;
          case 'js'   : commentStart = '/**';  commentEnd = '**/'; break;
          case 'css'  : commentStart = '/*';   commentEnd = '*/';  break;
        }

        return content + '\n\n'+
          commentStart + '\n'+
          'Copyright 2016 Google Inc. All Rights Reserved. \n'+
          'Use of this source code is governed by an MIT-style license that can be found'+
          'in the LICENSE file at http://material.angularjs.org/HEAD/license.\n'+
          commentEnd;
      }

      return data;
    }


    // Applies modifications the javascript prior to sending to codepen.
    // Currently merges js files and replaces the module with the Codepen
    // module.  See documentation for replaceDemoModuleWithCodepenModule.
    function processJs(jsFiles) {
      var mergedJs = mergeFiles(jsFiles).join(' ');
      var script = replaceDemoModuleWithCodepenModule(mergedJs);
      return script;
    }

    // Maps file contents to an array
    function mergeFiles(files) {
      return files.map(function(file) {
        return file.contents;
      });
    }

    // Adds class to parent element so that styles are applied correctly
    // Adds ng-app attribute.  This is the same module name provided in the asset-cache.js
    function applyAngularAttributesToParentElement(html, demo) {
      var tmp;

      // Grab only the DIV for the demo...
      angular.forEach(angular.element(html), function(it,key){
        if ((it.nodeName != "SCRIPT") && (it.nodeName != "#text")) {
          tmp = angular.element(it);
        }
      });

      tmp.addClass(demo.id);
      tmp.attr('ng-app', 'MyApp');
      return tmp[0].outerHTML;
    }

    // Adds templates inline in the html, so that templates are cached in the example
    function insertTemplatesAsScriptTags(indexHtml, demo) {
      if (demo.files.html.length) {
        var tmp = angular.element(indexHtml);
        angular.forEach(demo.files.html, function(template) {
          tmp.append("<script type='text/ng-template' id='" +
                     template.name + "'>" +
                     template.contents +
                     "</script>");
        });
        return tmp[0].outerHTML;
      }
      return indexHtml;
    }

    // Escapes ampersands so that after codepen unescapes the html the escaped code block
    // uses the correct escaped characters
    function htmlEscapeAmpersand(html) {
      return html
        .replace(/&/g, "&amp;");
    }

    // Required to make codePen work. Demos define their own module when running on the
    // docs site.  In order to ensure the codepen example can use the svg-asset-cache.js, the
    // module needs to match so that the $templateCache is populated with the necessary
    // assets.

    function replaceDemoModuleWithCodepenModule(file) {
      var matchAngularModule =  /\.module\(('[^']*'|"[^"]*")\s*,(\s*\[([^\]]*)\]\s*\))/ig;
      var modules = "['ngMaterial', 'ngMessages', 'material.svgAssetsCache']";

      // See scripts.js for list of external Angular libraries used for the demos

      return file.replace(matchAngularModule, ".module('MyApp',"+ modules + ")");
    }
  }
})();

angular.module('docsApp').constant('COMPONENTS', [
  {
    "name": "material.components.autocomplete",
    "type": "module",
    "outputPath": "partials/api/material.components.autocomplete/index.html",
    "url": "api/material.components.autocomplete",
    "label": "material.components.autocomplete",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/autocomplete/autocomplete.js",
    "docs": [
      {
        "name": "mdAutocomplete",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.autocomplete/directive/mdAutocomplete.html",
        "url": "api/directive/mdAutocomplete",
        "label": "mdAutocomplete",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/autocomplete/js/autocompleteDirective.js",
        "hasDemo": true
      },
      {
        "name": "mdHighlightText",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.autocomplete/directive/mdHighlightText.html",
        "url": "api/directive/mdHighlightText",
        "label": "mdHighlightText",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/autocomplete/js/highlightDirective.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.bottomSheet",
    "type": "module",
    "outputPath": "partials/api/material.components.bottomSheet/index.html",
    "url": "api/material.components.bottomSheet",
    "label": "material.components.bottomSheet",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/bottomSheet/bottom-sheet.js",
    "docs": [
      {
        "name": "$mdBottomSheet",
        "type": "service",
        "outputPath": "partials/api/material.components.bottomSheet/service/$mdBottomSheet.html",
        "url": "api/service/$mdBottomSheet",
        "label": "$mdBottomSheet",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/bottomSheet/bottom-sheet.js",
        "hasDemo": false
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.button",
    "type": "module",
    "outputPath": "partials/api/material.components.button/index.html",
    "url": "api/material.components.button",
    "label": "material.components.button",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/button/button.js",
    "docs": [
      {
        "name": "mdButton",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.button/directive/mdButton.html",
        "url": "api/directive/mdButton",
        "label": "mdButton",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/button/button.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.card",
    "type": "module",
    "outputPath": "partials/api/material.components.card/index.html",
    "url": "api/material.components.card",
    "label": "material.components.card",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/card/card.js",
    "docs": [
      {
        "name": "mdCard",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.card/directive/mdCard.html",
        "url": "api/directive/mdCard",
        "label": "mdCard",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/card/card.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.checkbox",
    "type": "module",
    "outputPath": "partials/api/material.components.checkbox/index.html",
    "url": "api/material.components.checkbox",
    "label": "material.components.checkbox",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/checkbox/checkbox.js",
    "docs": [
      {
        "name": "mdCheckbox",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.checkbox/directive/mdCheckbox.html",
        "url": "api/directive/mdCheckbox",
        "label": "mdCheckbox",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/checkbox/checkbox.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.chips",
    "type": "module",
    "outputPath": "partials/api/material.components.chips/index.html",
    "url": "api/material.components.chips",
    "label": "material.components.chips",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/chips/chips.js",
    "docs": [
      {
        "name": "mdChip",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.chips/directive/mdChip.html",
        "url": "api/directive/mdChip",
        "label": "mdChip",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/chips/js/chipDirective.js",
        "hasDemo": true
      },
      {
        "name": "mdChipRemove",
        "type": "directive",
        "restrict": {
          "element": false,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.chips/directive/mdChipRemove.html",
        "url": "api/directive/mdChipRemove",
        "label": "mdChipRemove",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/chips/js/chipRemoveDirective.js",
        "hasDemo": true
      },
      {
        "name": "mdChips",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.chips/directive/mdChips.html",
        "url": "api/directive/mdChips",
        "label": "mdChips",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/chips/js/chipsDirective.js",
        "hasDemo": true
      },
      {
        "name": "mdContactChips",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.chips/directive/mdContactChips.html",
        "url": "api/directive/mdContactChips",
        "label": "mdContactChips",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/chips/js/contactChipsDirective.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.colors",
    "type": "module",
    "outputPath": "partials/api/material.components.colors/index.html",
    "url": "api/material.components.colors",
    "label": "material.components.colors",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/colors/colors.js",
    "docs": [
      {
        "name": "$mdColors",
        "type": "service",
        "outputPath": "partials/api/material.components.colors/service/$mdColors.html",
        "url": "api/service/$mdColors",
        "label": "$mdColors",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/colors/colors.js",
        "hasDemo": false
      },
      {
        "name": "mdColors",
        "type": "directive",
        "restrict": {
          "element": false,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.colors/directive/mdColors.html",
        "url": "api/directive/mdColors",
        "label": "mdColors",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/colors/colors.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.content",
    "type": "module",
    "outputPath": "partials/api/material.components.content/index.html",
    "url": "api/material.components.content",
    "label": "material.components.content",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/content/content.js",
    "docs": [
      {
        "name": "mdContent",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.content/directive/mdContent.html",
        "url": "api/directive/mdContent",
        "label": "mdContent",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/content/content.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.datepicker",
    "type": "module",
    "outputPath": "partials/api/material.components.datepicker/index.html",
    "url": "api/material.components.datepicker",
    "label": "material.components.datepicker",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/datepicker/datePicker.js",
    "docs": [
      {
        "name": "mdCalendar",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.datepicker/directive/mdCalendar.html",
        "url": "api/directive/mdCalendar",
        "label": "mdCalendar",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/datepicker/js/calendar.js",
        "hasDemo": true
      },
      {
        "name": "$mdDateLocaleProvider",
        "type": "service",
        "outputPath": "partials/api/material.components.datepicker/service/$mdDateLocaleProvider.html",
        "url": "api/service/$mdDateLocaleProvider",
        "label": "$mdDateLocaleProvider",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/datepicker/js/dateLocaleProvider.js",
        "hasDemo": false
      },
      {
        "name": "mdDatepicker",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.datepicker/directive/mdDatepicker.html",
        "url": "api/directive/mdDatepicker",
        "label": "mdDatepicker",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/datepicker/js/datepickerDirective.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.dialog",
    "type": "module",
    "outputPath": "partials/api/material.components.dialog/index.html",
    "url": "api/material.components.dialog",
    "label": "material.components.dialog",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/dialog/dialog.js",
    "docs": [
      {
        "name": "mdDialog",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.dialog/directive/mdDialog.html",
        "url": "api/directive/mdDialog",
        "label": "mdDialog",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/dialog/dialog.js",
        "hasDemo": true
      },
      {
        "name": "$mdDialog",
        "type": "service",
        "outputPath": "partials/api/material.components.dialog/service/$mdDialog.html",
        "url": "api/service/$mdDialog",
        "label": "$mdDialog",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/dialog/dialog.js",
        "hasDemo": false
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.divider",
    "type": "module",
    "outputPath": "partials/api/material.components.divider/index.html",
    "url": "api/material.components.divider",
    "label": "material.components.divider",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/divider/divider.js",
    "docs": [
      {
        "name": "mdDivider",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.divider/directive/mdDivider.html",
        "url": "api/directive/mdDivider",
        "label": "mdDivider",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/divider/divider.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.fabActions",
    "type": "module",
    "outputPath": "partials/api/material.components.fabActions/index.html",
    "url": "api/material.components.fabActions",
    "label": "material.components.fabActions",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/fabActions/fabActions.js",
    "docs": [
      {
        "name": "mdFabActions",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.fabActions/directive/mdFabActions.html",
        "url": "api/directive/mdFabActions",
        "label": "mdFabActions",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/fabActions/fabActions.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.fabSpeedDial",
    "type": "module",
    "outputPath": "partials/api/material.components.fabSpeedDial/index.html",
    "url": "api/material.components.fabSpeedDial",
    "label": "material.components.fabSpeedDial",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/fabSpeedDial/fabSpeedDial.js",
    "docs": [
      {
        "name": "mdFabSpeedDial",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.fabSpeedDial/directive/mdFabSpeedDial.html",
        "url": "api/directive/mdFabSpeedDial",
        "label": "mdFabSpeedDial",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/fabSpeedDial/fabSpeedDial.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.fabToolbar",
    "type": "module",
    "outputPath": "partials/api/material.components.fabToolbar/index.html",
    "url": "api/material.components.fabToolbar",
    "label": "material.components.fabToolbar",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/fabToolbar/fabToolbar.js",
    "docs": [
      {
        "name": "mdFabToolbar",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.fabToolbar/directive/mdFabToolbar.html",
        "url": "api/directive/mdFabToolbar",
        "label": "mdFabToolbar",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/fabToolbar/fabToolbar.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.gridList",
    "type": "module",
    "outputPath": "partials/api/material.components.gridList/index.html",
    "url": "api/material.components.gridList",
    "label": "material.components.gridList",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/gridList/grid-list.js",
    "docs": [
      {
        "name": "mdGridList",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.gridList/directive/mdGridList.html",
        "url": "api/directive/mdGridList",
        "label": "mdGridList",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/gridList/grid-list.js",
        "hasDemo": true
      },
      {
        "name": "mdGridTile",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.gridList/directive/mdGridTile.html",
        "url": "api/directive/mdGridTile",
        "label": "mdGridTile",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/gridList/grid-list.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.icon",
    "type": "module",
    "outputPath": "partials/api/material.components.icon/index.html",
    "url": "api/material.components.icon",
    "label": "material.components.icon",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/icon/icon.js",
    "docs": [
      {
        "name": "mdIcon",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.icon/directive/mdIcon.html",
        "url": "api/directive/mdIcon",
        "label": "mdIcon",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/icon/js/iconDirective.js",
        "hasDemo": true
      },
      {
        "name": "$mdIconProvider",
        "type": "service",
        "outputPath": "partials/api/material.components.icon/service/$mdIconProvider.html",
        "url": "api/service/$mdIconProvider",
        "label": "$mdIconProvider",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/icon/js/iconService.js",
        "hasDemo": false
      },
      {
        "name": "$mdIcon",
        "type": "service",
        "outputPath": "partials/api/material.components.icon/service/$mdIcon.html",
        "url": "api/service/$mdIcon",
        "label": "$mdIcon",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/icon/js/iconService.js",
        "hasDemo": false
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.input",
    "type": "module",
    "outputPath": "partials/api/material.components.input/index.html",
    "url": "api/material.components.input",
    "label": "material.components.input",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/input/input.js",
    "docs": [
      {
        "name": "mdInputContainer",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.input/directive/mdInputContainer.html",
        "url": "api/directive/mdInputContainer",
        "label": "mdInputContainer",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/input/input.js",
        "hasDemo": true
      },
      {
        "name": "mdInput",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.input/directive/mdInput.html",
        "url": "api/directive/mdInput",
        "label": "mdInput",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/input/input.js",
        "hasDemo": true
      },
      {
        "name": "mdSelectOnFocus",
        "type": "directive",
        "restrict": {
          "element": false,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.input/directive/mdSelectOnFocus.html",
        "url": "api/directive/mdSelectOnFocus",
        "label": "mdSelectOnFocus",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/input/input.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.list",
    "type": "module",
    "outputPath": "partials/api/material.components.list/index.html",
    "url": "api/material.components.list",
    "label": "material.components.list",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/list/list.js",
    "docs": [
      {
        "name": "mdList",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.list/directive/mdList.html",
        "url": "api/directive/mdList",
        "label": "mdList",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/list/list.js",
        "hasDemo": true
      },
      {
        "name": "mdListItem",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.list/directive/mdListItem.html",
        "url": "api/directive/mdListItem",
        "label": "mdListItem",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/list/list.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.menu",
    "type": "module",
    "outputPath": "partials/api/material.components.menu/index.html",
    "url": "api/material.components.menu",
    "label": "material.components.menu",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/menu/menu.js",
    "docs": [
      {
        "name": "mdMenu",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.menu/directive/mdMenu.html",
        "url": "api/directive/mdMenu",
        "label": "mdMenu",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/menu/js/menuDirective.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.menuBar",
    "type": "module",
    "outputPath": "partials/api/material.components.menuBar/index.html",
    "url": "api/material.components.menuBar",
    "label": "material.components.menuBar",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/menuBar/menu-bar.js",
    "docs": [
      {
        "name": "mdMenuBar",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.menuBar/directive/mdMenuBar.html",
        "url": "api/directive/mdMenuBar",
        "label": "mdMenuBar",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/menuBar/js/menuBarDirective.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.navBar",
    "type": "module",
    "outputPath": "partials/api/material.components.navBar/index.html",
    "url": "api/material.components.navBar",
    "label": "material.components.navBar",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/navBar/navBar.js",
    "docs": [
      {
        "name": "mdNavBar",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.navBar/directive/mdNavBar.html",
        "url": "api/directive/mdNavBar",
        "label": "mdNavBar",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/navBar/navBar.js",
        "hasDemo": true
      },
      {
        "name": "mdNavItem",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.navBar/directive/mdNavItem.html",
        "url": "api/directive/mdNavItem",
        "label": "mdNavItem",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/navBar/navBar.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.panel",
    "type": "module",
    "outputPath": "partials/api/material.components.panel/index.html",
    "url": "api/material.components.panel",
    "label": "material.components.panel",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/panel/panel.js",
    "docs": [
      {
        "name": "$mdPanelProvider",
        "type": "service",
        "outputPath": "partials/api/material.components.panel/service/$mdPanelProvider.html",
        "url": "api/service/$mdPanelProvider",
        "label": "$mdPanelProvider",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/panel/panel.js",
        "hasDemo": false
      },
      {
        "name": "$mdPanel",
        "type": "service",
        "outputPath": "partials/api/material.components.panel/service/$mdPanel.html",
        "url": "api/service/$mdPanel",
        "label": "$mdPanel",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/panel/panel.js",
        "hasDemo": false
      },
      {
        "name": "MdPanelRef",
        "type": "type",
        "outputPath": "partials/api/material.components.panel/type/MdPanelRef.html",
        "url": "api/type/MdPanelRef",
        "label": "MdPanelRef",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/panel/panel.js",
        "hasDemo": false
      },
      {
        "name": "MdPanelPosition",
        "type": "type",
        "outputPath": "partials/api/material.components.panel/type/MdPanelPosition.html",
        "url": "api/type/MdPanelPosition",
        "label": "MdPanelPosition",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/panel/panel.js",
        "hasDemo": false
      },
      {
        "name": "MdPanelAnimation",
        "type": "type",
        "outputPath": "partials/api/material.components.panel/type/MdPanelAnimation.html",
        "url": "api/type/MdPanelAnimation",
        "label": "MdPanelAnimation",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/panel/panel.js",
        "hasDemo": false
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.progressCircular",
    "type": "module",
    "outputPath": "partials/api/material.components.progressCircular/index.html",
    "url": "api/material.components.progressCircular",
    "label": "material.components.progressCircular",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/progressCircular/progress-circular.js",
    "docs": [
      {
        "name": "mdProgressCircular",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.progressCircular/directive/mdProgressCircular.html",
        "url": "api/directive/mdProgressCircular",
        "label": "mdProgressCircular",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/progressCircular/js/progressCircularDirective.js",
        "hasDemo": true
      },
      {
        "name": "$mdProgressCircular",
        "type": "service",
        "outputPath": "partials/api/material.components.progressCircular/service/$mdProgressCircular.html",
        "url": "api/service/$mdProgressCircular",
        "label": "$mdProgressCircular",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/progressCircular/js/progressCircularProvider.js",
        "hasDemo": false
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.progressLinear",
    "type": "module",
    "outputPath": "partials/api/material.components.progressLinear/index.html",
    "url": "api/material.components.progressLinear",
    "label": "material.components.progressLinear",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/progressLinear/progress-linear.js",
    "docs": [
      {
        "name": "mdProgressLinear",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.progressLinear/directive/mdProgressLinear.html",
        "url": "api/directive/mdProgressLinear",
        "label": "mdProgressLinear",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/progressLinear/progress-linear.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.radioButton",
    "type": "module",
    "outputPath": "partials/api/material.components.radioButton/index.html",
    "url": "api/material.components.radioButton",
    "label": "material.components.radioButton",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/radioButton/radio-button.js",
    "docs": [
      {
        "name": "mdRadioGroup",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.radioButton/directive/mdRadioGroup.html",
        "url": "api/directive/mdRadioGroup",
        "label": "mdRadioGroup",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/radioButton/radio-button.js",
        "hasDemo": true
      },
      {
        "name": "mdRadioButton",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.radioButton/directive/mdRadioButton.html",
        "url": "api/directive/mdRadioButton",
        "label": "mdRadioButton",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/radioButton/radio-button.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.select",
    "type": "module",
    "outputPath": "partials/api/material.components.select/index.html",
    "url": "api/material.components.select",
    "label": "material.components.select",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/select/select.js",
    "docs": [
      {
        "name": "mdSelect",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.select/directive/mdSelect.html",
        "url": "api/directive/mdSelect",
        "label": "mdSelect",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/select/select.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.sidenav",
    "type": "module",
    "outputPath": "partials/api/material.components.sidenav/index.html",
    "url": "api/material.components.sidenav",
    "label": "material.components.sidenav",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/sidenav/sidenav.js",
    "docs": [
      {
        "name": "$mdSidenav",
        "type": "service",
        "outputPath": "partials/api/material.components.sidenav/service/$mdSidenav.html",
        "url": "api/service/$mdSidenav",
        "label": "$mdSidenav",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/sidenav/sidenav.js",
        "hasDemo": false
      },
      {
        "name": "mdSidenavFocus",
        "type": "directive",
        "restrict": {
          "element": false,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.sidenav/directive/mdSidenavFocus.html",
        "url": "api/directive/mdSidenavFocus",
        "label": "mdSidenavFocus",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/sidenav/sidenav.js",
        "hasDemo": true
      },
      {
        "name": "mdSidenav",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.sidenav/directive/mdSidenav.html",
        "url": "api/directive/mdSidenav",
        "label": "mdSidenav",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/sidenav/sidenav.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.slider",
    "type": "module",
    "outputPath": "partials/api/material.components.slider/index.html",
    "url": "api/material.components.slider",
    "label": "material.components.slider",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/slider/slider.js",
    "docs": [
      {
        "name": "mdSliderContainer",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.slider/directive/mdSliderContainer.html",
        "url": "api/directive/mdSliderContainer",
        "label": "mdSliderContainer",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/slider/slider.js",
        "hasDemo": true
      },
      {
        "name": "mdSlider",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.slider/directive/mdSlider.html",
        "url": "api/directive/mdSlider",
        "label": "mdSlider",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/slider/slider.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.sticky",
    "type": "module",
    "outputPath": "partials/api/material.components.sticky/index.html",
    "url": "api/material.components.sticky",
    "label": "material.components.sticky",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/sticky/sticky.js",
    "docs": [
      {
        "name": "$mdSticky",
        "type": "service",
        "outputPath": "partials/api/material.components.sticky/service/$mdSticky.html",
        "url": "api/service/$mdSticky",
        "label": "$mdSticky",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/sticky/sticky.js",
        "hasDemo": false
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.subheader",
    "type": "module",
    "outputPath": "partials/api/material.components.subheader/index.html",
    "url": "api/material.components.subheader",
    "label": "material.components.subheader",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/subheader/subheader.js",
    "docs": [
      {
        "name": "mdSubheader",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.subheader/directive/mdSubheader.html",
        "url": "api/directive/mdSubheader",
        "label": "mdSubheader",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/subheader/subheader.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.swipe",
    "type": "module",
    "outputPath": "partials/api/material.components.swipe/index.html",
    "url": "api/material.components.swipe",
    "label": "material.components.swipe",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/swipe/swipe.js",
    "docs": [
      {
        "name": "mdSwipeLeft",
        "type": "directive",
        "restrict": {
          "element": false,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.swipe/directive/mdSwipeLeft.html",
        "url": "api/directive/mdSwipeLeft",
        "label": "mdSwipeLeft",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/swipe/swipe.js",
        "hasDemo": true
      },
      {
        "name": "mdSwipeRight",
        "type": "directive",
        "restrict": {
          "element": false,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.swipe/directive/mdSwipeRight.html",
        "url": "api/directive/mdSwipeRight",
        "label": "mdSwipeRight",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/swipe/swipe.js",
        "hasDemo": true
      },
      {
        "name": "mdSwipeUp",
        "type": "directive",
        "restrict": {
          "element": false,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.swipe/directive/mdSwipeUp.html",
        "url": "api/directive/mdSwipeUp",
        "label": "mdSwipeUp",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/swipe/swipe.js",
        "hasDemo": true
      },
      {
        "name": "mdSwipeDown",
        "type": "directive",
        "restrict": {
          "element": false,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.swipe/directive/mdSwipeDown.html",
        "url": "api/directive/mdSwipeDown",
        "label": "mdSwipeDown",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/swipe/swipe.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.switch",
    "type": "module",
    "outputPath": "partials/api/material.components.switch/index.html",
    "url": "api/material.components.switch",
    "label": "material.components.switch",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/switch/switch.js",
    "docs": [
      {
        "name": "mdSwitch",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.switch/directive/mdSwitch.html",
        "url": "api/directive/mdSwitch",
        "label": "mdSwitch",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/switch/switch.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.tabs",
    "type": "module",
    "outputPath": "partials/api/material.components.tabs/index.html",
    "url": "api/material.components.tabs",
    "label": "material.components.tabs",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/tabs/tabs.js",
    "docs": [
      {
        "name": "mdTab",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.tabs/directive/mdTab.html",
        "url": "api/directive/mdTab",
        "label": "mdTab",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/tabs/js/tabDirective.js",
        "hasDemo": true
      },
      {
        "name": "mdTabs",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.tabs/directive/mdTabs.html",
        "url": "api/directive/mdTabs",
        "label": "mdTabs",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/tabs/js/tabsDirective.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.toast",
    "type": "module",
    "outputPath": "partials/api/material.components.toast/index.html",
    "url": "api/material.components.toast",
    "label": "material.components.toast",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/toast/toast.js",
    "docs": [
      {
        "name": "$mdToast",
        "type": "service",
        "outputPath": "partials/api/material.components.toast/service/$mdToast.html",
        "url": "api/service/$mdToast",
        "label": "$mdToast",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/toast/toast.js",
        "hasDemo": false
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.toolbar",
    "type": "module",
    "outputPath": "partials/api/material.components.toolbar/index.html",
    "url": "api/material.components.toolbar",
    "label": "material.components.toolbar",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/toolbar/toolbar.js",
    "docs": [
      {
        "name": "mdToolbar",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.toolbar/directive/mdToolbar.html",
        "url": "api/directive/mdToolbar",
        "label": "mdToolbar",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/toolbar/toolbar.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.tooltip",
    "type": "module",
    "outputPath": "partials/api/material.components.tooltip/index.html",
    "url": "api/material.components.tooltip",
    "label": "material.components.tooltip",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/tooltip/tooltip.js",
    "docs": [
      {
        "name": "mdTooltip",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.tooltip/directive/mdTooltip.html",
        "url": "api/directive/mdTooltip",
        "label": "mdTooltip",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/tooltip/tooltip.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.truncate",
    "type": "module",
    "outputPath": "partials/api/material.components.truncate/index.html",
    "url": "api/material.components.truncate",
    "label": "material.components.truncate",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/truncate/truncate.js",
    "docs": [
      {
        "name": "mdTruncate",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.truncate/directive/mdTruncate.html",
        "url": "api/directive/mdTruncate",
        "label": "mdTruncate",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/truncate/truncate.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.virtualRepeat",
    "type": "module",
    "outputPath": "partials/api/material.components.virtualRepeat/index.html",
    "url": "api/material.components.virtualRepeat",
    "label": "material.components.virtualRepeat",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/virtualRepeat/virtual-repeater.js",
    "docs": [
      {
        "name": "mdVirtualRepeatContainer",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.virtualRepeat/directive/mdVirtualRepeatContainer.html",
        "url": "api/directive/mdVirtualRepeatContainer",
        "label": "mdVirtualRepeatContainer",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/virtualRepeat/virtual-repeater.js",
        "hasDemo": true
      },
      {
        "name": "mdVirtualRepeat",
        "type": "directive",
        "restrict": {
          "element": false,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.virtualRepeat/directive/mdVirtualRepeat.html",
        "url": "api/directive/mdVirtualRepeat",
        "label": "mdVirtualRepeat",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/virtualRepeat/virtual-repeater.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.whiteframe",
    "type": "module",
    "outputPath": "partials/api/material.components.whiteframe/index.html",
    "url": "api/material.components.whiteframe",
    "label": "material.components.whiteframe",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/whiteframe/whiteframe.js",
    "docs": [
      {
        "name": "mdWhiteframe",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.whiteframe/directive/mdWhiteframe.html",
        "url": "api/directive/mdWhiteframe",
        "label": "mdWhiteframe",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/whiteframe/whiteframe.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.core.aria",
    "type": "module",
    "outputPath": "partials/api/material.core.aria/index.html",
    "url": "api/material.core.aria",
    "label": "material.core.aria",
    "module": "material.core",
    "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/aria/aria.js",
    "docs": [
      {
        "name": "$mdAriaProvider",
        "type": "service",
        "outputPath": "partials/api/material.core.aria/service/$mdAriaProvider.html",
        "url": "api/service/$mdAriaProvider",
        "label": "$mdAriaProvider",
        "module": "material.core",
        "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/aria/aria.js",
        "hasDemo": false
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.core.compiler",
    "type": "module",
    "outputPath": "partials/api/material.core.compiler/index.html",
    "url": "api/material.core.compiler",
    "label": "material.core.compiler",
    "module": "material.core",
    "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/compiler/compiler.js",
    "docs": [
      {
        "name": "$mdCompiler",
        "type": "service",
        "outputPath": "partials/api/material.core.compiler/service/$mdCompiler.html",
        "url": "api/service/$mdCompiler",
        "label": "$mdCompiler",
        "module": "material.core",
        "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/compiler/compiler.js",
        "hasDemo": false
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.core.interaction",
    "type": "module",
    "outputPath": "partials/api/material.core.interaction/index.html",
    "url": "api/material.core.interaction",
    "label": "material.core.interaction",
    "module": "material.core",
    "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/interaction/interaction.js",
    "docs": [
      {
        "name": "$mdInteraction",
        "type": "service",
        "outputPath": "partials/api/material.core.interaction/service/$mdInteraction.html",
        "url": "api/service/$mdInteraction",
        "label": "$mdInteraction",
        "module": "material.core",
        "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/interaction/interaction.js",
        "hasDemo": false
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.core.liveannouncer",
    "type": "module",
    "outputPath": "partials/api/material.core.liveannouncer/index.html",
    "url": "api/material.core.liveannouncer",
    "label": "material.core.liveannouncer",
    "module": "material.core",
    "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/liveAnnouncer/live-announcer.js",
    "docs": [
      {
        "name": "$mdLiveAnnouncer",
        "type": "service",
        "outputPath": "partials/api/material.core.liveannouncer/service/$mdLiveAnnouncer.html",
        "url": "api/service/$mdLiveAnnouncer",
        "label": "$mdLiveAnnouncer",
        "module": "material.core",
        "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/liveAnnouncer/live-announcer.js",
        "hasDemo": false
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.core.ripple",
    "type": "module",
    "outputPath": "partials/api/material.core.ripple/index.html",
    "url": "api/material.core.ripple",
    "label": "material.core.ripple",
    "module": "material.core",
    "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/ripple/ripple.js",
    "docs": [
      {
        "name": "mdInkRipple",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.core.ripple/directive/mdInkRipple.html",
        "url": "api/directive/mdInkRipple",
        "label": "mdInkRipple",
        "module": "material.core",
        "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/ripple/ripple.js",
        "hasDemo": true
      },
      {
        "name": "$mdInkRipple",
        "type": "service",
        "outputPath": "partials/api/material.core.ripple/service/$mdInkRipple.html",
        "url": "api/service/$mdInkRipple",
        "label": "$mdInkRipple",
        "module": "material.core",
        "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/ripple/ripple.js",
        "hasDemo": false
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.core.theming",
    "type": "module",
    "outputPath": "partials/api/material.core.theming/index.html",
    "url": "api/material.core.theming",
    "label": "material.core.theming",
    "module": "material.core",
    "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/theming/theming.js",
    "docs": [
      {
        "name": "$mdThemingProvider",
        "type": "service",
        "outputPath": "partials/api/material.core.theming/service/$mdThemingProvider.html",
        "url": "api/service/$mdThemingProvider",
        "label": "$mdThemingProvider",
        "module": "material.core",
        "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/theming/theming.js",
        "hasDemo": false
      },
      {
        "name": "$mdTheming",
        "type": "service",
        "outputPath": "partials/api/material.core.theming/service/$mdTheming.html",
        "url": "api/service/$mdTheming",
        "label": "$mdTheming",
        "module": "material.core",
        "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/theming/theming.js",
        "hasDemo": false
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.core.util",
    "type": "module",
    "outputPath": "partials/api/material.core.util/index.html",
    "url": "api/material.core.util",
    "label": "material.core.util",
    "module": "material.core",
    "githubUrl": "https://github.com/angular/material/blob/master/src/core/util/util.js",
    "docs": [
      {
        "name": "mdAutofocus",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.core.util/directive/mdAutofocus.html",
        "url": "api/directive/mdAutofocus",
        "label": "mdAutofocus",
        "module": "material.core",
        "githubUrl": "https://github.com/angular/material/blob/master/src/core/util/autofocus.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  }
]);

angular.module('docsApp').constant('PAGES', {
  "CSS": [
    {
      "name": "button",
      "outputPath": "partials/CSS/button.html",
      "url": "/CSS/button",
      "label": "button"
    },
    {
      "name": "checkbox",
      "outputPath": "partials/CSS/checkbox.html",
      "url": "/CSS/checkbox",
      "label": "checkbox"
    },
    {
      "name": "Typography",
      "outputPath": "partials/CSS/typography.html",
      "url": "/CSS/typography",
      "label": "Typography"
    }
  ],
  "Theming": [
    {
      "name": "Introduction and Terms",
      "outputPath": "partials/Theming/01_introduction.html",
      "url": "/Theming/01_introduction",
      "label": "Introduction and Terms"
    },
    {
      "name": "Declarative Syntax",
      "outputPath": "partials/Theming/02_declarative_syntax.html",
      "url": "/Theming/02_declarative_syntax",
      "label": "Declarative Syntax"
    },
    {
      "name": "Configuring a Theme",
      "outputPath": "partials/Theming/03_configuring_a_theme.html",
      "url": "/Theming/03_configuring_a_theme",
      "label": "Configuring a Theme"
    },
    {
      "name": "Multiple Themes",
      "outputPath": "partials/Theming/04_multiple_themes.html",
      "url": "/Theming/04_multiple_themes",
      "label": "Multiple Themes"
    },
    {
      "name": "Theming under the hood",
      "outputPath": "partials/Theming/05_under_the_hood.html",
      "url": "/Theming/05_under_the_hood",
      "label": "Theming under the hood"
    },
    {
      "name": "Browser Colors",
      "outputPath": "partials/Theming/06_browser_color.html",
      "url": "/Theming/06_browser_color",
      "label": "Browser Colors"
    }
  ]
});

(function() {
  angular.module('docsApp')
    .directive('docsCssApiTable', DocsCssApiTableDirective)
    .directive('docsCssSelector', DocsCssSelectorDirective);

  function DocsCssApiTableDirective() {
    return {
      restrict: 'E',
      transclude: true,

      bindToController: true,
      controller: function() {},
      controllerAs: '$ctrl',

      scope: {},

      template:
      '<table class="md-api-table md-css-table">' +
      '  <thead>' +
      '    <tr><th>Available Selectors</th></tr>' +
      '  </thead>' +
      '  <tbody ng-transclude>' +
      '  </tbody>' +
      '</table>'
    }
  }

  function DocsCssSelectorDirective() {
    return {
      restrict: 'E',
      transclude: true,
      replace: true,

      bindToController: true,
      controller: function() {},
      controllerAs: '$ctrl',

      scope: {
        code: '@'
      },

      template:
      '<tr>' +
      '  <td>' +
      '    <code class="md-css-selector">{{$ctrl.code}}</code>' +
      '    <span ng-transclude></span>' +
      '  </td>' +
      '</tr>'
    }
  }
})();

angular.module('docsApp').constant('DEMOS', [
  {
    "name": "autocomplete",
    "moduleName": "material.components.autocomplete",
    "label": "Autocomplete",
    "demos": [
      {
        "ngModule": {
          "name": "autocompleteDemo",
          "module": "autocompleteDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "autocompletedemoBasicUsage",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/autocomplete/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.autocomplete",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/autocomplete/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "autocompleteCustomTemplateDemo",
          "module": "autocompleteCustomTemplateDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "autocompletedemoCustomTemplate",
        "css": [
          {
            "name": "style.global.css",
            "label": "style.global.css",
            "fileType": "css",
            "outputPath": "demo-partials/autocomplete/demoCustomTemplate/style.global.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/autocomplete/demoCustomTemplate/script.js"
          }
        ],
        "moduleName": "material.components.autocomplete",
        "name": "demoCustomTemplate",
        "label": "Custom Template",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/autocomplete/demoCustomTemplate/index.html"
        }
      },
      {
        "ngModule": {
          "name": "autocompleteFloatingLabelDemo",
          "module": "autocompleteFloatingLabelDemo",
          "dependencies": [
            "ngMaterial",
            "ngMessages"
          ]
        },
        "id": "autocompletedemoFloatingLabel",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/autocomplete/demoFloatingLabel/script.js"
          }
        ],
        "moduleName": "material.components.autocomplete",
        "name": "demoFloatingLabel",
        "label": "Floating Label",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/autocomplete/demoFloatingLabel/index.html"
        }
      },
      {
        "ngModule": {
          "name": "autocompleteDemoInsideDialog",
          "module": "autocompleteDemoInsideDialog",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "autocompletedemoInsideDialog",
        "css": [],
        "html": [
          {
            "name": "dialog.tmpl.html",
            "label": "dialog.tmpl.html",
            "fileType": "html",
            "outputPath": "demo-partials/autocomplete/demoInsideDialog/dialog.tmpl.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/autocomplete/demoInsideDialog/script.js"
          }
        ],
        "moduleName": "material.components.autocomplete",
        "name": "demoInsideDialog",
        "label": "Inside Dialog",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/autocomplete/demoInsideDialog/index.html"
        }
      }
    ],
    "url": "demo/autocomplete"
  },
  {
    "name": "bottomSheet",
    "moduleName": "material.components.bottomSheet",
    "label": "Bottom Sheet",
    "demos": [
      {
        "ngModule": {
          "name": "bottomSheetDemo1",
          "module": "bottomSheetDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "bottomSheetdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/bottomSheet/demoBasicUsage/style.css"
          }
        ],
        "html": [
          {
            "name": "bottom-sheet-grid-template.html",
            "label": "bottom-sheet-grid-template.html",
            "fileType": "html",
            "outputPath": "demo-partials/bottomSheet/demoBasicUsage/bottom-sheet-grid-template.html"
          },
          {
            "name": "bottom-sheet-list-template.html",
            "label": "bottom-sheet-list-template.html",
            "fileType": "html",
            "outputPath": "demo-partials/bottomSheet/demoBasicUsage/bottom-sheet-list-template.html"
          },
          {
            "name": "readme.html",
            "label": "readme.html",
            "fileType": "html",
            "outputPath": "demo-partials/bottomSheet/demoBasicUsage/readme.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/bottomSheet/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.bottomSheet",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/bottomSheet/demoBasicUsage/index.html"
        }
      }
    ],
    "url": "demo/bottomSheet"
  },
  {
    "name": "button",
    "moduleName": "material.components.button",
    "label": "Button",
    "demos": [
      {
        "ngModule": {
          "name": "buttonsDemo1",
          "module": "buttonsDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "buttondemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/button/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/button/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.button",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/button/demoBasicUsage/index.html"
        }
      }
    ],
    "url": "demo/button"
  },
  {
    "name": "card",
    "moduleName": "material.components.card",
    "label": "Card",
    "demos": [
      {
        "ngModule": {
          "name": "cardDemo1",
          "module": "cardDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "carddemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/card/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/card/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.card",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/card/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "cardDemo2",
          "module": "cardDemo2",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "carddemoCardActionButtons",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/card/demoCardActionButtons/script.js"
          }
        ],
        "moduleName": "material.components.card",
        "name": "demoCardActionButtons",
        "label": "Card Action Buttons",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/card/demoCardActionButtons/index.html"
        }
      },
      {
        "ngModule": {
          "name": "cardDemo3",
          "module": "cardDemo3",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "carddemoInCardActions",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/card/demoInCardActions/script.js"
          }
        ],
        "moduleName": "material.components.card",
        "name": "demoInCardActions",
        "label": "In Card Actions",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/card/demoInCardActions/index.html"
        }
      }
    ],
    "url": "demo/card"
  },
  {
    "name": "checkbox",
    "moduleName": "material.components.checkbox",
    "label": "Checkbox",
    "demos": [
      {
        "ngModule": {
          "name": "checkboxDemo1",
          "module": "checkboxDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "checkboxdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/checkbox/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/checkbox/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.checkbox",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/checkbox/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "checkboxDemo3",
          "module": "checkboxDemo3",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "checkboxdemoSelectAll",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/checkbox/demoSelectAll/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/checkbox/demoSelectAll/script.js"
          }
        ],
        "moduleName": "material.components.checkbox",
        "name": "demoSelectAll",
        "label": "Select All",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/checkbox/demoSelectAll/index.html"
        }
      },
      {
        "ngModule": {
          "name": "checkboxDemo2",
          "module": "checkboxDemo2",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "checkboxdemoSyncing",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/checkbox/demoSyncing/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/checkbox/demoSyncing/script.js"
          }
        ],
        "moduleName": "material.components.checkbox",
        "name": "demoSyncing",
        "label": "Syncing",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/checkbox/demoSyncing/index.html"
        }
      }
    ],
    "url": "demo/checkbox"
  },
  {
    "name": "chips",
    "moduleName": "material.components.chips",
    "label": "Chips",
    "demos": [
      {
        "ngModule": {
          "name": "chipsDemo",
          "module": "chipsDemo",
          "dependencies": [
            "ngMaterial",
            "ngMessages"
          ]
        },
        "id": "chipsdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/chips/demoBasicUsage/style.css"
          }
        ],
        "html": [
          {
            "name": "readme.html",
            "label": "readme.html",
            "fileType": "html",
            "outputPath": "demo-partials/chips/demoBasicUsage/readme.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/chips/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.chips",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/chips/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "contactChipsDemo",
          "module": "contactChipsDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "chipsdemoContactChips",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/chips/demoContactChips/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/chips/demoContactChips/script.js"
          }
        ],
        "moduleName": "material.components.chips",
        "name": "demoContactChips",
        "label": "Contact Chips",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/chips/demoContactChips/index.html"
        }
      },
      {
        "ngModule": {
          "name": "chipsCustomInputDemo",
          "module": "chipsCustomInputDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "chipsdemoCustomInputs",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/chips/demoCustomInputs/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/chips/demoCustomInputs/script.js"
          }
        ],
        "moduleName": "material.components.chips",
        "name": "demoCustomInputs",
        "label": "Custom Inputs",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/chips/demoCustomInputs/index.html"
        }
      },
      {
        "ngModule": {
          "name": "chipsCustomSeparatorDemo",
          "module": "chipsCustomSeparatorDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "chipsdemoCustomSeparatorKeys",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/chips/demoCustomSeparatorKeys/script.js"
          }
        ],
        "moduleName": "material.components.chips",
        "name": "demoCustomSeparatorKeys",
        "label": "Custom Separator Keys",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/chips/demoCustomSeparatorKeys/index.html"
        }
      },
      {
        "ngModule": {
          "name": "staticChipsDemo",
          "module": "staticChipsDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "chipsdemoStaticChips",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/chips/demoStaticChips/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/chips/demoStaticChips/script.js"
          }
        ],
        "moduleName": "material.components.chips",
        "name": "demoStaticChips",
        "label": "Static Chips",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/chips/demoStaticChips/index.html"
        }
      }
    ],
    "url": "demo/chips"
  },
  {
    "name": "colors",
    "moduleName": "material.components.colors",
    "label": "Colors",
    "demos": [
      {
        "ngModule": {
          "name": "colorsDemo",
          "module": "colorsDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "colorsdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/colors/demoBasicUsage/style.css"
          }
        ],
        "html": [
          {
            "name": "regularCard.tmpl.html",
            "label": "regularCard.tmpl.html",
            "fileType": "html",
            "outputPath": "demo-partials/colors/demoBasicUsage/regularCard.tmpl.html"
          },
          {
            "name": "userCard.tmpl.html",
            "label": "userCard.tmpl.html",
            "fileType": "html",
            "outputPath": "demo-partials/colors/demoBasicUsage/userCard.tmpl.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/colors/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.colors",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/colors/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "colorsThemePickerDemo",
          "module": "colorsThemePickerDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "colorsdemoThemePicker",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/colors/demoThemePicker/style.css"
          }
        ],
        "html": [
          {
            "name": "themePreview.tmpl.html",
            "label": "themePreview.tmpl.html",
            "fileType": "html",
            "outputPath": "demo-partials/colors/demoThemePicker/themePreview.tmpl.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/colors/demoThemePicker/script.js"
          }
        ],
        "moduleName": "material.components.colors",
        "name": "demoThemePicker",
        "label": "Theme Picker",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/colors/demoThemePicker/index.html"
        }
      }
    ],
    "url": "demo/colors"
  },
  {
    "name": "content",
    "moduleName": "material.components.content",
    "label": "Content",
    "demos": [
      {
        "ngModule": {
          "name": "contentDemo1",
          "module": "contentDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "contentdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/content/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/content/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.content",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/content/demoBasicUsage/index.html"
        }
      }
    ],
    "url": "demo/content"
  },
  {
    "name": "datepicker",
    "moduleName": "material.components.datepicker",
    "label": "Datepicker",
    "demos": [
      {
        "ngModule": {
          "name": "datepickerBasicUsage",
          "module": "datepickerBasicUsage",
          "dependencies": [
            "ngMaterial",
            "ngMessages"
          ]
        },
        "id": "datepickerdemoBasicUsage",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/datepicker/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.datepicker",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/datepicker/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "datepickerValidations",
          "module": "datepickerValidations",
          "dependencies": [
            "ngMaterial",
            "ngMessages"
          ]
        },
        "id": "datepickerdemoValidations",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/datepicker/demoValidations/script.js"
          }
        ],
        "moduleName": "material.components.datepicker",
        "name": "demoValidations",
        "label": "Validations",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/datepicker/demoValidations/index.html"
        }
      }
    ],
    "url": "demo/datepicker"
  },
  {
    "name": "dialog",
    "moduleName": "material.components.dialog",
    "label": "Dialog",
    "demos": [
      {
        "ngModule": {
          "name": "dialogDemo1",
          "module": "dialogDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "dialogdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/dialog/demoBasicUsage/style.css"
          }
        ],
        "html": [
          {
            "name": "dialog1.tmpl.html",
            "label": "dialog1.tmpl.html",
            "fileType": "html",
            "outputPath": "demo-partials/dialog/demoBasicUsage/dialog1.tmpl.html"
          },
          {
            "name": "tabDialog.tmpl.html",
            "label": "tabDialog.tmpl.html",
            "fileType": "html",
            "outputPath": "demo-partials/dialog/demoBasicUsage/tabDialog.tmpl.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/dialog/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.dialog",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/dialog/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "dialogDemo2",
          "module": "dialogDemo2",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "dialogdemoOpenFromCloseTo",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/dialog/demoOpenFromCloseTo/script.js"
          }
        ],
        "moduleName": "material.components.dialog",
        "name": "demoOpenFromCloseTo",
        "label": "Open From Close To",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/dialog/demoOpenFromCloseTo/index.html"
        }
      },
      {
        "ngModule": {
          "name": "dialogDemo3",
          "module": "dialogDemo3",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "dialogdemoThemeInheritance",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/dialog/demoThemeInheritance/style.css"
          }
        ],
        "html": [
          {
            "name": "dialog1.tmpl.html",
            "label": "dialog1.tmpl.html",
            "fileType": "html",
            "outputPath": "demo-partials/dialog/demoThemeInheritance/dialog1.tmpl.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/dialog/demoThemeInheritance/script.js"
          }
        ],
        "moduleName": "material.components.dialog",
        "name": "demoThemeInheritance",
        "label": "Theme Inheritance",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/dialog/demoThemeInheritance/index.html"
        }
      }
    ],
    "url": "demo/dialog"
  },
  {
    "name": "divider",
    "moduleName": "material.components.divider",
    "label": "Divider",
    "demos": [
      {
        "ngModule": {
          "name": "dividerDemo1",
          "module": "dividerDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "dividerdemoBasicUsage",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/divider/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.divider",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/divider/demoBasicUsage/index.html"
        }
      }
    ],
    "url": "demo/divider"
  },
  {
    "name": "fabSpeedDial",
    "moduleName": "material.components.fabSpeedDial",
    "label": "FAB Speed Dial",
    "demos": [
      {
        "ngModule": {
          "name": "fabSpeedDialDemoBasicUsage",
          "module": "fabSpeedDialDemoBasicUsage",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "fabSpeedDialdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/fabSpeedDial/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/fabSpeedDial/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.fabSpeedDial",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/fabSpeedDial/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "fabSpeedDialDemoMoreOptions",
          "module": "fabSpeedDialDemoMoreOptions",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "fabSpeedDialdemoMoreOptions",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/fabSpeedDial/demoMoreOptions/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/fabSpeedDial/demoMoreOptions/script.js"
          }
        ],
        "moduleName": "material.components.fabSpeedDial",
        "name": "demoMoreOptions",
        "label": "More Options",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/fabSpeedDial/demoMoreOptions/index.html"
        }
      }
    ],
    "url": "demo/fabSpeedDial"
  },
  {
    "name": "fabToolbar",
    "moduleName": "material.components.fabToolbar",
    "label": "FAB Toolbar",
    "demos": [
      {
        "ngModule": {
          "name": "fabToolbarBasicUsageDemo",
          "module": "fabToolbarBasicUsageDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "fabToolbardemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/fabToolbar/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/fabToolbar/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.fabToolbar",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/fabToolbar/demoBasicUsage/index.html"
        }
      }
    ],
    "url": "demo/fabToolbar"
  },
  {
    "name": "gridList",
    "moduleName": "material.components.gridList",
    "label": "Grid List",
    "demos": [
      {
        "ngModule": {
          "name": "gridListDemo1",
          "module": "gridListDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "gridListdemoBasicUsage",
        "css": [
          {
            "name": "styles.css",
            "label": "styles.css",
            "fileType": "css",
            "outputPath": "demo-partials/gridList/demoBasicUsage/styles.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/gridList/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.gridList",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/gridList/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "gridListDemoApp",
          "module": "gridListDemoApp",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "gridListdemoDynamicTiles",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/gridList/demoDynamicTiles/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/gridList/demoDynamicTiles/script.js"
          }
        ],
        "moduleName": "material.components.gridList",
        "name": "demoDynamicTiles",
        "label": "Dynamic Tiles",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/gridList/demoDynamicTiles/index.html"
        }
      },
      {
        "ngModule": {
          "name": "gridListDemo1",
          "module": "gridListDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "gridListdemoResponsiveUsage",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/gridList/demoResponsiveUsage/script.js"
          }
        ],
        "moduleName": "material.components.gridList",
        "name": "demoResponsiveUsage",
        "label": "Responsive Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/gridList/demoResponsiveUsage/index.html"
        }
      }
    ],
    "url": "demo/gridList"
  },
  {
    "name": "icon",
    "moduleName": "material.components.icon",
    "label": "Icon",
    "demos": [
      {
        "ngModule": {
          "name": "appDemoFontIconsWithClassnames",
          "module": "appDemoFontIconsWithClassnames",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "icondemoFontIconsWithClassnames",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/icon/demoFontIconsWithClassnames/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/icon/demoFontIconsWithClassnames/script.js"
          }
        ],
        "moduleName": "material.components.icon",
        "name": "demoFontIconsWithClassnames",
        "label": "Font Icons With Classnames",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/icon/demoFontIconsWithClassnames/index.html"
        }
      },
      {
        "ngModule": {
          "name": "appDemoFontIconsWithLigatures",
          "module": "appDemoFontIconsWithLigatures",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "icondemoFontIconsWithLigatures",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/icon/demoFontIconsWithLigatures/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/icon/demoFontIconsWithLigatures/script.js"
          }
        ],
        "moduleName": "material.components.icon",
        "name": "demoFontIconsWithLigatures",
        "label": "Font Icons With Ligatures",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/icon/demoFontIconsWithLigatures/index.html"
        }
      },
      {
        "ngModule": {
          "name": "appDemoSvgIcons",
          "module": "appDemoSvgIcons",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "icondemoLoadSvgIconsFromUrl",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/icon/demoLoadSvgIconsFromUrl/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/icon/demoLoadSvgIconsFromUrl/script.js"
          }
        ],
        "moduleName": "material.components.icon",
        "name": "demoLoadSvgIconsFromUrl",
        "label": "Load Svg Icons From Url",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/icon/demoLoadSvgIconsFromUrl/index.html"
        }
      },
      {
        "ngModule": {
          "name": "appSvgIconSets",
          "module": "appSvgIconSets",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "icondemoSvgIconSets",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/icon/demoSvgIconSets/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/icon/demoSvgIconSets/script.js"
          }
        ],
        "moduleName": "material.components.icon",
        "name": "demoSvgIconSets",
        "label": "Svg Icon Sets",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/icon/demoSvgIconSets/index.html"
        }
      },
      {
        "ngModule": {
          "name": "appUsingTemplateCache",
          "module": "appUsingTemplateCache",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "icondemoUsingTemplateRequest",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/icon/demoUsingTemplateRequest/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/icon/demoUsingTemplateRequest/script.js"
          }
        ],
        "moduleName": "material.components.icon",
        "name": "demoUsingTemplateRequest",
        "label": "Using Template Request",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/icon/demoUsingTemplateRequest/index.html"
        }
      }
    ],
    "url": "demo/icon"
  },
  {
    "name": "input",
    "moduleName": "material.components.input",
    "label": "Input",
    "demos": [
      {
        "ngModule": {
          "name": "inputBasicDemo",
          "module": "inputBasicDemo",
          "dependencies": [
            "ngMaterial",
            "ngMessages"
          ]
        },
        "id": "inputdemoBasicUsage",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/input/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.input",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/input/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "inputErrorsApp",
          "module": "inputErrorsApp",
          "dependencies": [
            "ngMaterial",
            "ngMessages"
          ]
        },
        "id": "inputdemoErrors",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/input/demoErrors/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/input/demoErrors/script.js"
          }
        ],
        "moduleName": "material.components.input",
        "name": "demoErrors",
        "label": "Errors",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/input/demoErrors/index.html"
        }
      },
      {
        "ngModule": {
          "name": "inputErrorsAdvancedApp",
          "module": "inputErrorsAdvancedApp",
          "dependencies": [
            "ngMaterial",
            "ngMessages"
          ]
        },
        "id": "inputdemoErrorsAdvanced",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/input/demoErrorsAdvanced/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/input/demoErrorsAdvanced/script.js"
          }
        ],
        "moduleName": "material.components.input",
        "name": "demoErrorsAdvanced",
        "label": "Errors Advanced",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/input/demoErrorsAdvanced/index.html"
        }
      },
      {
        "ngModule": {
          "name": "inputIconDemo",
          "module": "inputIconDemo",
          "dependencies": [
            "ngMaterial",
            "ngMessages"
          ]
        },
        "id": "inputdemoIcons",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/input/demoIcons/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/input/demoIcons/script.js"
          }
        ],
        "moduleName": "material.components.input",
        "name": "demoIcons",
        "label": "Icons",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/input/demoIcons/index.html"
        }
      }
    ],
    "url": "demo/input"
  },
  {
    "name": "list",
    "moduleName": "material.components.list",
    "label": "List",
    "demos": [
      {
        "ngModule": {
          "name": "listDemo1",
          "module": "listDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "listdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/list/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/list/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.list",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/list/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "listDemo2",
          "module": "listDemo2",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "listdemoListControls",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/list/demoListControls/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/list/demoListControls/script.js"
          }
        ],
        "moduleName": "material.components.list",
        "name": "demoListControls",
        "label": "List Controls",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/list/demoListControls/index.html"
        }
      }
    ],
    "url": "demo/list"
  },
  {
    "name": "menu",
    "moduleName": "material.components.menu",
    "label": "Menu",
    "demos": [
      {
        "ngModule": {
          "name": "menuDemoBasic",
          "module": "menuDemoBasic",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "menudemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/menu/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/menu/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.menu",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/menu/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "menuDemoCustomTrigger",
          "module": "menuDemoCustomTrigger",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "menudemoCustomTrigger",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/menu/demoCustomTrigger/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/menu/demoCustomTrigger/script.js"
          }
        ],
        "moduleName": "material.components.menu",
        "name": "demoCustomTrigger",
        "label": "Custom Trigger",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/menu/demoCustomTrigger/index.html"
        }
      },
      {
        "ngModule": {
          "name": "menuDemoPosition",
          "module": "menuDemoPosition",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "menudemoMenuPositionModes",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/menu/demoMenuPositionModes/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/menu/demoMenuPositionModes/script.js"
          }
        ],
        "moduleName": "material.components.menu",
        "name": "demoMenuPositionModes",
        "label": "Menu Position Modes",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/menu/demoMenuPositionModes/index.html"
        }
      },
      {
        "ngModule": {
          "name": "menuDemoWidth",
          "module": "menuDemoWidth",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "menudemoMenuWidth",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/menu/demoMenuWidth/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/menu/demoMenuWidth/script.js"
          }
        ],
        "moduleName": "material.components.menu",
        "name": "demoMenuWidth",
        "label": "Menu Width",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/menu/demoMenuWidth/index.html"
        }
      }
    ],
    "url": "demo/menu"
  },
  {
    "name": "menuBar",
    "moduleName": "material.components.menuBar",
    "label": "Menu Bar",
    "demos": [
      {
        "ngModule": {
          "name": "menuBarDemoBasic",
          "module": "menuBarDemoBasic",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "menuBardemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/menuBar/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/menuBar/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.menuBar",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/menuBar/demoBasicUsage/index.html"
        }
      }
    ],
    "url": "demo/menuBar"
  },
  {
    "name": "navBar",
    "moduleName": "material.components.navBar",
    "label": "Nav Bar",
    "demos": [
      {
        "ngModule": {
          "name": "navBarDemoBasicUsage",
          "module": "navBarDemoBasicUsage",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "navBardemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/navBar/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/navBar/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.navBar",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/navBar/demoBasicUsage/index.html"
        }
      }
    ],
    "url": "demo/navBar"
  },
  {
    "name": "panel",
    "moduleName": "material.components.panel",
    "label": "Panel",
    "demos": [
      {
        "ngModule": {
          "name": "panelDemo",
          "module": "panelDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "paneldemoBasicUsage",
        "css": [
          {
            "name": "style.global.css",
            "label": "style.global.css",
            "fileType": "css",
            "outputPath": "demo-partials/panel/demoBasicUsage/style.global.css"
          }
        ],
        "html": [
          {
            "name": "panel.tmpl.html",
            "label": "panel.tmpl.html",
            "fileType": "html",
            "outputPath": "demo-partials/panel/demoBasicUsage/panel.tmpl.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/panel/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.panel",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/panel/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "panelGroupsDemo",
          "module": "panelGroupsDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "paneldemoGroups",
        "css": [
          {
            "name": "style.global.css",
            "label": "style.global.css",
            "fileType": "css",
            "outputPath": "demo-partials/panel/demoGroups/style.global.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/panel/demoGroups/script.js"
          }
        ],
        "moduleName": "material.components.panel",
        "name": "demoGroups",
        "label": "Groups",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/panel/demoGroups/index.html"
        }
      },
      {
        "ngModule": {
          "name": "panelAnimationsDemo",
          "module": "panelAnimationsDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "paneldemoPanelAnimations",
        "css": [
          {
            "name": "style.global.css",
            "label": "style.global.css",
            "fileType": "css",
            "outputPath": "demo-partials/panel/demoPanelAnimations/style.global.css"
          }
        ],
        "html": [
          {
            "name": "panel.tmpl.html",
            "label": "panel.tmpl.html",
            "fileType": "html",
            "outputPath": "demo-partials/panel/demoPanelAnimations/panel.tmpl.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/panel/demoPanelAnimations/script.js"
          }
        ],
        "moduleName": "material.components.panel",
        "name": "demoPanelAnimations",
        "label": "Panel Animations",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/panel/demoPanelAnimations/index.html"
        }
      },
      {
        "ngModule": {
          "name": "panelProviderDemo",
          "module": "panelProviderDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "paneldemoPanelProvider",
        "css": [
          {
            "name": "style.global.css",
            "label": "style.global.css",
            "fileType": "css",
            "outputPath": "demo-partials/panel/demoPanelProvider/style.global.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/panel/demoPanelProvider/script.js"
          }
        ],
        "moduleName": "material.components.panel",
        "name": "demoPanelProvider",
        "label": "Panel Provider",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/panel/demoPanelProvider/index.html"
        }
      }
    ],
    "url": "demo/panel"
  },
  {
    "name": "progressCircular",
    "moduleName": "material.components.progressCircular",
    "label": "Progress Circular",
    "demos": [
      {
        "ngModule": {
          "name": "progressCircularDemo1",
          "module": "progressCircularDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "progressCirculardemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/progressCircular/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/progressCircular/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.progressCircular",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/progressCircular/demoBasicUsage/index.html"
        }
      }
    ],
    "url": "demo/progressCircular"
  },
  {
    "name": "progressLinear",
    "moduleName": "material.components.progressLinear",
    "label": "Progress Linear",
    "demos": [
      {
        "ngModule": {
          "name": "progressLinearDemo1",
          "module": "progressLinearDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "progressLineardemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/progressLinear/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/progressLinear/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.progressLinear",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/progressLinear/demoBasicUsage/index.html"
        }
      }
    ],
    "url": "demo/progressLinear"
  },
  {
    "name": "radioButton",
    "moduleName": "material.components.radioButton",
    "label": "Radio Button",
    "demos": [
      {
        "ngModule": {
          "name": "radioDemo1",
          "module": "radioDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "radioButtondemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/radioButton/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/radioButton/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.radioButton",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/radioButton/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "radioDemo2",
          "module": "radioDemo2",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "radioButtondemoMultiColumn",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/radioButton/demoMultiColumn/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/radioButton/demoMultiColumn/script.js"
          }
        ],
        "moduleName": "material.components.radioButton",
        "name": "demoMultiColumn",
        "label": "Multi Column",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/radioButton/demoMultiColumn/index.html"
        }
      }
    ],
    "url": "demo/radioButton"
  },
  {
    "name": "select",
    "moduleName": "material.components.select",
    "label": "Select",
    "demos": [
      {
        "ngModule": {
          "name": "selectDemoBasic",
          "module": "selectDemoBasic",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "selectdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/select/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/select/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.select",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/select/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "selectDemoOptGroups",
          "module": "selectDemoOptGroups",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "selectdemoOptionGroups",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/select/demoOptionGroups/script.js"
          }
        ],
        "moduleName": "material.components.select",
        "name": "demoOptionGroups",
        "label": "Option Groups",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/select/demoOptionGroups/index.html"
        }
      },
      {
        "ngModule": {
          "name": "selectDemoOptionsAsync",
          "module": "selectDemoOptionsAsync",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "selectdemoOptionsWithAsyncSearch",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/select/demoOptionsWithAsyncSearch/script.js"
          }
        ],
        "moduleName": "material.components.select",
        "name": "demoOptionsWithAsyncSearch",
        "label": "Options With Async Search",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/select/demoOptionsWithAsyncSearch/index.html"
        }
      },
      {
        "ngModule": {
          "name": "selectDemoSelectHeader",
          "module": "selectDemoSelectHeader",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "selectdemoSelectHeader",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/select/demoSelectHeader/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/select/demoSelectHeader/script.js"
          }
        ],
        "moduleName": "material.components.select",
        "name": "demoSelectHeader",
        "label": "Select Header",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/select/demoSelectHeader/index.html"
        }
      },
      {
        "ngModule": {
          "name": "selectDemoSelectedText",
          "module": "selectDemoSelectedText",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "selectdemoSelectedText",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/select/demoSelectedText/script.js"
          }
        ],
        "moduleName": "material.components.select",
        "name": "demoSelectedText",
        "label": "Selected Text",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/select/demoSelectedText/index.html"
        }
      },
      {
        "ngModule": {
          "name": "selectDemoValidation",
          "module": "selectDemoValidation",
          "dependencies": [
            "ngMaterial",
            "ngMessages"
          ]
        },
        "id": "selectdemoValidations",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/select/demoValidations/script.js"
          }
        ],
        "moduleName": "material.components.select",
        "name": "demoValidations",
        "label": "Validations",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/select/demoValidations/index.html"
        }
      }
    ],
    "url": "demo/select"
  },
  {
    "name": "sidenav",
    "moduleName": "material.components.sidenav",
    "label": "Sidenav",
    "demos": [
      {
        "ngModule": {
          "name": "sidenavDemo1",
          "module": "sidenavDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "sidenavdemoBasicUsage",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/sidenav/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.sidenav",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/sidenav/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "sidenavDemo2",
          "module": "sidenavDemo2",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "sidenavdemoCustomSidenav",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/sidenav/demoCustomSidenav/script.js"
          }
        ],
        "moduleName": "material.components.sidenav",
        "name": "demoCustomSidenav",
        "label": "Custom Sidenav",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/sidenav/demoCustomSidenav/index.html"
        }
      }
    ],
    "url": "demo/sidenav"
  },
  {
    "name": "slider",
    "moduleName": "material.components.slider",
    "label": "Slider",
    "demos": [
      {
        "ngModule": {
          "name": "sliderDemo1",
          "module": "sliderDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "sliderdemoBasicUsage",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/slider/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.slider",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/slider/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "sliderDemo2",
          "module": "sliderDemo2",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "sliderdemoVertical",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/slider/demoVertical/script.js"
          }
        ],
        "moduleName": "material.components.slider",
        "name": "demoVertical",
        "label": "Vertical",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/slider/demoVertical/index.html"
        }
      }
    ],
    "url": "demo/slider"
  },
  {
    "name": "subheader",
    "moduleName": "material.components.subheader",
    "label": "Subheader",
    "demos": [
      {
        "ngModule": {
          "name": "subheaderBasicDemo",
          "module": "subheaderBasicDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "subheaderdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/subheader/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/subheader/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.subheader",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/subheader/demoBasicUsage/index.html"
        }
      }
    ],
    "url": "demo/subheader"
  },
  {
    "name": "swipe",
    "moduleName": "material.components.swipe",
    "label": "Swipe",
    "demos": [
      {
        "ngModule": {
          "name": "demoSwipe",
          "module": "demoSwipe",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "swipedemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/swipe/demoBasicUsage/style.css"
          }
        ],
        "html": [
          {
            "name": "readme.html",
            "label": "readme.html",
            "fileType": "html",
            "outputPath": "demo-partials/swipe/demoBasicUsage/readme.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/swipe/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.swipe",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/swipe/demoBasicUsage/index.html"
        }
      }
    ],
    "url": "demo/swipe"
  },
  {
    "name": "switch",
    "moduleName": "material.components.switch",
    "label": "Switch",
    "demos": [
      {
        "ngModule": {
          "name": "switchDemo1",
          "module": "switchDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "switchdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/switch/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/switch/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.switch",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/switch/demoBasicUsage/index.html"
        }
      }
    ],
    "url": "demo/switch"
  },
  {
    "name": "tabs",
    "moduleName": "material.components.tabs",
    "label": "Tabs",
    "demos": [
      {
        "ngModule": {
          "name": "tabsDemoDynamicHeight",
          "module": "tabsDemoDynamicHeight",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "tabsdemoDynamicHeight",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/tabs/demoDynamicHeight/style.css"
          }
        ],
        "html": [
          {
            "name": "readme.html",
            "label": "readme.html",
            "fileType": "html",
            "outputPath": "demo-partials/tabs/demoDynamicHeight/readme.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/tabs/demoDynamicHeight/script.js"
          }
        ],
        "moduleName": "material.components.tabs",
        "name": "demoDynamicHeight",
        "label": "Dynamic Height",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/tabs/demoDynamicHeight/index.html"
        }
      },
      {
        "ngModule": {
          "name": "tabsDemoDynamicTabs",
          "module": "tabsDemoDynamicTabs",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "tabsdemoDynamicTabs",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/tabs/demoDynamicTabs/style.css"
          }
        ],
        "html": [
          {
            "name": "readme.html",
            "label": "readme.html",
            "fileType": "html",
            "outputPath": "demo-partials/tabs/demoDynamicTabs/readme.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/tabs/demoDynamicTabs/script.js"
          }
        ],
        "moduleName": "material.components.tabs",
        "name": "demoDynamicTabs",
        "label": "Dynamic Tabs",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/tabs/demoDynamicTabs/index.html"
        }
      },
      {
        "ngModule": {
          "name": "tabsDemoIconTabs",
          "module": "tabsDemoIconTabs",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "tabsdemoStaticTabs",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/tabs/demoStaticTabs/style.css"
          }
        ],
        "html": [
          {
            "name": "readme.html",
            "label": "readme.html",
            "fileType": "html",
            "outputPath": "demo-partials/tabs/demoStaticTabs/readme.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/tabs/demoStaticTabs/script.js"
          }
        ],
        "moduleName": "material.components.tabs",
        "name": "demoStaticTabs",
        "label": "Static Tabs",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/tabs/demoStaticTabs/index.html"
        }
      }
    ],
    "url": "demo/tabs"
  },
  {
    "name": "toast",
    "moduleName": "material.components.toast",
    "label": "Toast",
    "demos": [
      {
        "ngModule": {
          "name": "toastDemo1",
          "module": "toastDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "toastdemoBasicUsage",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/toast/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.toast",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/toast/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "toastDemo2",
          "module": "toastDemo2",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "toastdemoCustomUsage",
        "css": [],
        "html": [
          {
            "name": "toast-template.html",
            "label": "toast-template.html",
            "fileType": "html",
            "outputPath": "demo-partials/toast/demoCustomUsage/toast-template.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/toast/demoCustomUsage/script.js"
          }
        ],
        "moduleName": "material.components.toast",
        "name": "demoCustomUsage",
        "label": "Custom Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/toast/demoCustomUsage/index.html"
        }
      }
    ],
    "url": "demo/toast"
  },
  {
    "name": "toolbar",
    "moduleName": "material.components.toolbar",
    "label": "Toolbar",
    "demos": [
      {
        "ngModule": {
          "name": "toolbarDemo1",
          "module": "toolbarDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "toolbardemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/toolbar/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/toolbar/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.toolbar",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/toolbar/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "toolbarDemo2",
          "module": "toolbarDemo2",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "toolbardemoScrollShrink",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/toolbar/demoScrollShrink/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/toolbar/demoScrollShrink/script.js"
          }
        ],
        "moduleName": "material.components.toolbar",
        "name": "demoScrollShrink",
        "label": "Scroll Shrink",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/toolbar/demoScrollShrink/index.html"
        }
      }
    ],
    "url": "demo/toolbar"
  },
  {
    "name": "tooltip",
    "moduleName": "material.components.tooltip",
    "label": "Tooltip",
    "demos": [
      {
        "ngModule": {
          "name": "tooltipDemo",
          "module": "tooltipDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "tooltipdemoBasicUsage",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/tooltip/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.tooltip",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/tooltip/demoBasicUsage/index.html"
        }
      }
    ],
    "url": "demo/tooltip"
  },
  {
    "name": "truncate",
    "moduleName": "material.components.truncate",
    "label": "Truncate",
    "demos": [
      {
        "ngModule": "",
        "id": "truncatedemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/truncate/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [],
        "moduleName": "material.components.truncate",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/truncate/demoBasicUsage/index.html"
        }
      }
    ],
    "url": "demo/truncate"
  },
  {
    "name": "virtualRepeat",
    "moduleName": "material.components.virtualRepeat",
    "label": "Virtual Repeat",
    "demos": [
      {
        "ngModule": {
          "name": "virtualRepeatDeferredLoadingDemo",
          "module": "virtualRepeatDeferredLoadingDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "virtualRepeatdemoDeferredLoading",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/virtualRepeat/demoDeferredLoading/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/virtualRepeat/demoDeferredLoading/script.js"
          }
        ],
        "moduleName": "material.components.virtualRepeat",
        "name": "demoDeferredLoading",
        "label": "Deferred Loading",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/virtualRepeat/demoDeferredLoading/index.html"
        }
      },
      {
        "ngModule": {
          "name": "virtualRepeatHorizontalDemo",
          "module": "virtualRepeatHorizontalDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "virtualRepeatdemoHorizontalUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/virtualRepeat/demoHorizontalUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/virtualRepeat/demoHorizontalUsage/script.js"
          }
        ],
        "moduleName": "material.components.virtualRepeat",
        "name": "demoHorizontalUsage",
        "label": "Horizontal Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/virtualRepeat/demoHorizontalUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "virtualRepeatInfiniteScrollDemo",
          "module": "virtualRepeatInfiniteScrollDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "virtualRepeatdemoInfiniteScroll",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/virtualRepeat/demoInfiniteScroll/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/virtualRepeat/demoInfiniteScroll/script.js"
          }
        ],
        "moduleName": "material.components.virtualRepeat",
        "name": "demoInfiniteScroll",
        "label": "Infinite Scroll",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/virtualRepeat/demoInfiniteScroll/index.html"
        }
      },
      {
        "ngModule": {
          "name": "virtualRepeatScrollToDemo",
          "module": "virtualRepeatScrollToDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "virtualRepeatdemoScrollTo",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/virtualRepeat/demoScrollTo/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/virtualRepeat/demoScrollTo/script.js"
          }
        ],
        "moduleName": "material.components.virtualRepeat",
        "name": "demoScrollTo",
        "label": "Scroll To",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/virtualRepeat/demoScrollTo/index.html"
        }
      },
      {
        "ngModule": {
          "name": "virtualRepeatVerticalDemo",
          "module": "virtualRepeatVerticalDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "virtualRepeatdemoVerticalUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/virtualRepeat/demoVerticalUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/virtualRepeat/demoVerticalUsage/script.js"
          }
        ],
        "moduleName": "material.components.virtualRepeat",
        "name": "demoVerticalUsage",
        "label": "Vertical Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/virtualRepeat/demoVerticalUsage/index.html"
        }
      }
    ],
    "url": "demo/virtualRepeat"
  },
  {
    "name": "whiteframe",
    "moduleName": "material.components.whiteframe",
    "label": "Whiteframe",
    "demos": [
      {
        "ngModule": {
          "name": "whiteframeBasicUsage",
          "module": "whiteframeBasicUsage",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "whiteframedemoBasicClassUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/whiteframe/demoBasicClassUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/whiteframe/demoBasicClassUsage/script.js"
          }
        ],
        "moduleName": "material.components.whiteframe",
        "name": "demoBasicClassUsage",
        "label": "Basic Class Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/whiteframe/demoBasicClassUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "whiteframeDirectiveUsage",
          "module": "whiteframeDirectiveUsage",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "whiteframedemoDirectiveAttributeUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/whiteframe/demoDirectiveAttributeUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/whiteframe/demoDirectiveAttributeUsage/script.js"
          }
        ],
        "moduleName": "material.components.whiteframe",
        "name": "demoDirectiveAttributeUsage",
        "label": "Directive Attribute Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/whiteframe/demoDirectiveAttributeUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "whiteframeDirectiveUsage",
          "module": "whiteframeDirectiveUsage",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "whiteframedemoDirectiveInterpolation",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/whiteframe/demoDirectiveInterpolation/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/whiteframe/demoDirectiveInterpolation/script.js"
          }
        ],
        "moduleName": "material.components.whiteframe",
        "name": "demoDirectiveInterpolation",
        "label": "Directive Interpolation",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/whiteframe/demoDirectiveInterpolation/index.html"
        }
      }
    ],
    "url": "demo/whiteframe"
  }
]);
angular.module('docsApp')
.directive('layoutAlign', function() { return angular.noop; })
.directive('layout', function() { return angular.noop; })
.directive('docsDemo', ['$mdUtil', function($mdUtil) {
  return {
    restrict: 'E',
    scope: true,
    templateUrl: 'partials/docs-demo.tmpl.html',
    transclude: true,
    controller: ['$scope', '$element', '$attrs', '$interpolate', 'codepen', DocsDemoCtrl],
    controllerAs: 'demoCtrl',
    bindToController: true
  };

  function DocsDemoCtrl($scope, $element, $attrs, $interpolate, codepen) {
    var self = this;

    self.interpolateCode = angular.isDefined($attrs.interpolateCode);
    self.demoId = $interpolate($attrs.demoId || '')($scope.$parent);
    self.demoTitle = $interpolate($attrs.demoTitle || '')($scope.$parent);
    self.demoModule = $interpolate($attrs.demoModule || '')($scope.$parent);

    $attrs.$observe('demoTitle',  function(value) { self.demoTitle  = value || self.demoTitle; });
    $attrs.$observe('demoId',     function(value) { self.demoId     = value || self.demoId; });
    $attrs.$observe('demoModule', function(value) { self.demoModule = value || self.demoModule;  });

    self.files = {
      css: [], js: [], html: []
    };

    self.addFile = function(name, contentsPromise) {
      var file = {
        name: convertName(name),
        contentsPromise: contentsPromise,
        fileType: name.split('.').pop()
      };
      contentsPromise.then(function(contents) {
        file.contents = contents;
      });

      if (name === 'index.html') {
        self.files.index = file;
      } else if (name === 'readme.html') {
       self.demoDescription = file;
      } else {
        self.files[file.fileType] = self.files[file.fileType] || [];
        self.files[file.fileType].push(file);
      }

      self.orderedFiles = []
        .concat(self.files.index || [])
        .concat(self.files.js || [])
        .concat(self.files.css || [])
        .concat(self.files.html || []);

    };

    self.editOnCodepen = function() {
      codepen.editOnCodepen({
        title: self.demoTitle,
        files: self.files,
        id: self.demoId,
        module: self.demoModule
      });
    };

    function convertName(name) {
      switch(name) {
        case "index.html" : return "HTML";
        case "script.js" : return "JS";
        case "style.css" : return "CSS";
        case "style.global.css" : return "CSS";
        default : return name;
      }
    }

  }
}])
.directive('demoFile', ['$q', '$interpolate', function($q, $interpolate) {
  return {
    restrict: 'E',
    require: '^docsDemo',
    compile: compile
  };

  function compile(element, attr) {
    var contentsAttr = attr.contents;
    var html = element.html();
    var name = attr.name;
    element.contents().remove();

    return function postLink(scope, element, attr, docsDemoCtrl) {
      docsDemoCtrl.addFile(
        $interpolate(name)(scope),
        $q.when(scope.$eval(contentsAttr) || html)
      );
      element.remove();
    };
  }
}])

.filter('toHtml', ['$sce', function($sce) {
  return function(str) {
    return $sce.trustAsHtml(str);
  };
}]);

angular.module('docsApp').directive('demoInclude', [
  '$q',
  '$compile',
  '$timeout',
function($q, $compile, $timeout) {
  return {
    restrict: 'E',
    link: postLink
  };

  function postLink(scope, element, attr) {
    var demoContainer;

    // Interpret the expression given as `demo-include files="something"`
    var files = scope.$eval(attr.files) || {};
    var ngModule = scope.$eval(attr.module) || '';

    $timeout(handleDemoIndexFile);

    /**
     * Fetch the index file, and if it contains its own ngModule
     * then bootstrap a new angular app with that ngModule. Otherwise, compile
     * the demo into the current ng-app.
     */
    function handleDemoIndexFile() {
      files.index.contentsPromise.then(function(contents) {
        demoContainer = angular.element(
          '<div class="demo-content ' + ngModule + '">'
        );

        var isStandalone = !!ngModule;
        var demoScope;
        var demoCompileService;
        if (isStandalone) {
          angular.bootstrap(demoContainer[0], [ngModule]);
          demoScope = demoContainer.scope();
          demoCompileService = demoContainer.injector().get('$compile');
          scope.$on('$destroy', function() {
            demoScope.$destroy();
          });

        } else {
          demoScope = scope.$new();
          demoCompileService = $compile;
        }

        // Once everything is loaded, put the demo into the DOM
        $q.all([
          handleDemoStyles(),
          handleDemoTemplates()
        ]).finally(function() {
          demoScope.$evalAsync(function() {
            element.append(demoContainer);
            demoContainer.html(contents);
            demoCompileService(demoContainer.contents())(demoScope);
          });
        });
      });

    }


    /**
     * Fetch the demo styles, and append them to the DOM.
     */
    function handleDemoStyles() {
      return $q.all(files.css.map(function(file) {
        return file.contentsPromise;
      }))
      .then(function(styles) {
        styles = styles.join('\n'); //join styles as one string

        var styleElement = angular.element('<style>' + styles + '</style>');
        document.body.appendChild(styleElement[0]);

        scope.$on('$destroy', function() {
          styleElement.remove();
        });
      });

    }

    /**
     * Fetch the templates for this demo, and put the templates into
     * the demo app's templateCache, with a url that allows the demo apps
     * to reference their templates local to the demo index file.
     *
     * For example, make it so the dialog demo can reference templateUrl
     * 'my-dialog.tmpl.html' instead of having to reference the url
     * 'generated/material.components.dialog/demo/demo1/my-dialog.tmpl.html'.
     */
    function handleDemoTemplates() {
      return $q.all(files.html.map(function(file) {

        return file.contentsPromise.then(function(contents) {
          // Get the $templateCache instance that goes with the demo's specific ng-app.
          var demoTemplateCache = demoContainer.injector().get('$templateCache');
          demoTemplateCache.put(file.name, contents);

          scope.$on('$destroy', function() {
            demoTemplateCache.remove(file.name);
          });

        });

      }));

    }

  }

}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/contributors.tmpl.html',
    '<div ng-controller="GuideCtrl" class="doc-content">\n' +
    '  <md-content>\n' +
    '    <p>\n' +
    '      We are thankful for the amazing community and <em>contributors</em> to Angular Material.<br/>\n' +
    '      Shown below is a list of all our contributors: developers who submitted fixes and improvements to ngMaterial.\n' +
    '    </p>\n' +
    '    <md-divider></md-divider>\n' +
    '\n' +
    '    <h2>Contributors</h2>\n' +
    '\n' +
    '    <p style="margin-top:-10px;"> (sorted by GitHub name)</p>\n' +
    '    <br/>\n' +
    '\n' +
    '    <div class="contributor_tables">\n' +
    '\n' +
    '      <!-- User the \'contributors.json\' generated by \'npm run contributors\' -->\n' +
    '\n' +
    '      <table ng-repeat="row in github.contributors"> \n' +
    '        <thead>\n' +
    '        <tr>\n' +
    '          <th style="text-align:center" ng-repeat="user in row">\n' +
    '            <a href="{{user.html_url}}" >\n' +
    '              <img  alt="{{user.login}}"\n' +
    '                    ng-src="{{user.avatar_url}}"\n' +
    '                    width="{{github.imageSize}}" class="md-avatar">\n' +
    '            </a>\n' +
    '          </th>\n' +
    '        </tr>\n' +
    '        </thead>\n' +
    '        <tbody>\n' +
    '        <tr>\n' +
    '          <td style="text-align:center" ng-repeat="user in row">\n' +
    '            <a href="{{user.html_url}}" class="md-primary">{{user.login}}</a>\n' +
    '          </td>\n' +
    '          <td></td>\n' +
    '        </tr>\n' +
    '        </tbody>\n' +
    '      </table>\n' +
    '\n' +
    '    </div>\n' +
    '  </md-content>\n' +
    '</div>\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/demo.tmpl.html',
    '<docs-demo\n' +
    '    ng-repeat="demo in demos"\n' +
    '    demo-id="{{demo.id}}"\n' +
    '    demo-title="{{demo.label}}"\n' +
    '    demo-module="{{demo.ngModule.module}}">\n' +
    '  <demo-file\n' +
    '      ng-repeat="file in demo.$files"\n' +
    '      name="{{file.name}}"\n' +
    '      contents="file.httpPromise"></demo-file>\n' +
    '</docs-demo>\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/docs-demo.tmpl.html',
    '<div class="doc-demo-content doc-content">\n' +
    '  <div flex layout="column" style="z-index:1">\n' +
    '\n' +
    '    <div class="doc-description" ng-bind-html="demoCtrl.demoDescription.contents | toHtml"></div>\n' +
    '\n' +
    '    <div ng-transclude></div>\n' +
    '\n' +
    '    <section class="demo-container md-whiteframe-z1"\n' +
    '      ng-class="{\'show-source\': demoCtrl.$showSource}" >\n' +
    '\n' +
    '      <md-toolbar class="demo-toolbar md-primary">\n' +
    '        <div class="md-toolbar-tools">\n' +
    '          <h3>{{demoCtrl.demoTitle}}</h3>\n' +
    '          <span flex></span>\n' +
    '          <md-button\n' +
    '            class="md-icon-button"\n' +
    '            aria-label="View Source"\n' +
    '            ng-class="{ active: demoCtrl.$showSource }"\n' +
    '            ng-click="demoCtrl.$showSource = !demoCtrl.$showSource">\n' +
    '              <md-tooltip md-autohide>View Source</md-tooltip>\n' +
    '              <md-icon md-svg-src="img/icons/ic_code_24px.svg"></md-icon>\n' +
    '          </md-button>\n' +
    '          <md-button\n' +
    '              ng-hide="{{exampleNotEditable}}"\n' +
    '              hide-sm\n' +
    '              ng-click="demoCtrl.editOnCodepen()"\n' +
    '              aria-label="Edit on CodePen"\n' +
    '              class="md-icon-button">\n' +
    '            <md-tooltip md-autohide>Edit on CodePen</md-tooltip>\n' +
    '            <md-icon md-svg-src="img/icons/codepen-logo.svg"></md-icon>\n' +
    '          </md-button>\n' +
    '        </div>\n' +
    '      </md-toolbar>\n' +
    '\n' +
    '      <!-- Source views -->\n' +
    '      <md-tabs class="demo-source-tabs md-primary" ng-show="demoCtrl.$showSource" style="min-height: 0;">\n' +
    '        <md-tab ng-repeat="file in demoCtrl.orderedFiles" label="{{file.name}}">\n' +
    '          <md-content md-scroll-y class="demo-source-container">\n' +
    '            <hljs class="no-header" code="file.contentsPromise" lang="{{file.fileType}}" should-interpolate="demoCtrl.interpolateCode">\n' +
    '            </hljs>\n' +
    '          </md-content>\n' +
    '        </md-tab>\n' +
    '      </md-tabs>\n' +
    '\n' +
    '      <!-- Live Demos -->\n' +
    '      <demo-include files="demoCtrl.files" module="demoCtrl.demoModule" class="{{demoCtrl.demoId}}">\n' +
    '      </demo-include>\n' +
    '    </section>\n' +
    '\n' +
    '  </div>\n' +
    '</div>\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/getting-started.tmpl.html',
    '<div ng-controller="GuideCtrl" class="doc-content">\n' +
    '  <md-content>\n' +
    '    <p><em>New to Angular? Before getting into Angular Material, it might be helpful to:</em></p>\n' +
    '\n' +
    '    <ul>\n' +
    '      <li>\n' +
    '        watch the videos about <a\n' +
    '          href="https://egghead.io/articles/new-to-angularjs-start-learning-here" target="_blank"\n' +
    '          title="AngularJS Framework">Angular.js framework</a></li>\n' +
    '      <li>\n' +
    '        read the\n' +
    '        <a href="https://material.google.com/" target="_blank"\n' +
    '           title="Material Design">Material Design </a> specifications for components,\n' +
    '        animations, styles, and layouts.\n' +
    '      </li>\n' +
    '    </ul>\n' +
    '\n' +
    '    <h2>How do I start with Angular Material?</h2>\n' +
    '    <ul style="margin-bottom: 2em;">\n' +
    '      <li>\n' +
    '        Visit the <a href="http://codepen.io/team/AngularMaterial/" target="_blank"\n' +
    '                       title="Codepen Material Community">CodePen Community for Angular Material</a>\n' +
    '      </li>\n' +
    '\n' +
    '      <li>\n' +
    '        <a href="https://github.com/angular/material-start/tree/es6-tutorial" target="_blank"\n' +
    '             title="Material-Start Tutorial">Learn with Material-Start: 10-step Tutorial (es6)</a>\n' +
    '      </li>\n' +
    '\n' +
    '      <li>\n' +
    '        <a href="https://github.com/angular/material-start/tree/es6" target="_blank"\n' +
    '             title="Material Start - ES6">Learn with Material-Start: Completed (es6)</a>\n' +
    '      </li>\n' +
    '\n' +
    '      <li>\n' +
    '        <a href="https://github.com/angular/material-start/tree/typescript" target="_blank"\n' +
    '           title="Material Start - Typescript">Learn with Material-Start: Completed (Typescript)</a>\n' +
    '      </li>\n' +
    '\n' +
    '      <li>\n' +
    '        <a href="https://github.com/angular/material-start/tree/master" target="_blank"\n' +
    '           title="Material-Start - ES5">Learn with Material-Start: Completed (es5)</a>\n' +
    '      </li>\n' +
    '\n' +
    '      <li>\n' +
    '        <a href="http://codepen.io/team/AngularMaterial/pen/RrbXyW" target="_blank">Start with a\n' +
    '        blank CodePen Material Application</a>\n' +
    '      </li>\n' +
    '\n' +
    '      <li style="margin-bottom: 30px;">\n' +
    '        <a href="https://github.com/angular/material-start" target="_blank"\n' +
    '           title="GitHub Starter Project">Use the Github Starter Project</a>\n' +
    '      </li>\n' +
    '\n' +
    '      <li>Use the "Edit on CodePen" button on any of our Demos<br/>\n' +
    '        <img\n' +
    '            src="https://cloud.githubusercontent.com/assets/210413/11568997/ed86795a-99b4-11e5-898e-1da172be80da.png"\n' +
    '            style="width:75%;margin: 10px 30px 0 0">\n' +
    '      </li>\n' +
    '\n' +
    '    </ul>\n' +
    '\n' +
    '    <h3>Build a Material Application (blank shell)</h3>\n' +
    '\n' +
    '    <p>\n' +
    '      See this example application on CodePen that loads\n' +
    '      the Angular Material library from the Google CDN:\n' +
    '    </p>\n' +
    '\n' +
    '    <iframe height=\'777\' scrolling=\'no\'\n' +
    '            src=\'//codepen.io/team/AngularMaterial/embed/RrbXyW/?height=777&theme-id=21180&default-tab=html\'\n' +
    '            frameborder=\'no\' allowtransparency=\'true\' allowfullscreen=\'true\' style=\'width: 100%;\'>\n' +
    '      See the Pen <a\n' +
    '        href=\'http://codepen.io/team/AngularMaterial/pen/RrbXyW/\'>Angular Material - Blank\n' +
    '      Starter</a> by Angular\n' +
    '      Material (<a href=\'http://codepen.io/AngularMaterial\'>@AngularMaterial</a>) on <a\n' +
    '        href=\'http://codepen.io\'>CodePen</a>.\n' +
    '    </iframe>\n' +
    '\n' +
    '\n' +
    '    <p>\n' +
    '      Now just your add your Angular Material components and other HTML content to your Blank\n' +
    '      starter app.\n' +
    '    </p>\n' +
    '\n' +
    '    <br/>\n' +
    '\n' +
    '    <hr>\n' +
    '\n' +
    '    <h3>Our CodePen Community</h3>\n' +
    '    <p>\n' +
    '      You can also visit our\n' +
    '      <a href="http://codepen.io/team/AngularMaterial/" target="_blank"\n' +
    '         title="Codepen Community">CodePen Community</a> to explore more samples and ideas.\n' +
    '    </p>\n' +
    '    <div layout-align="center" style="width: 100%">\n' +
    '      <a href="http://codepen.io/collection/XExqGz/" target="_blank" title="Codepen Community"\n' +
    '         style="text-decoration:none; border: 0 none;">\n' +
    '        <img\n' +
    '            src="https://cloud.githubusercontent.com/assets/210413/11613879/544f0b1e-9bf6-11e5-9923-27dd0d891bfd.png"\n' +
    '            style="text-decoration:none; border: 0 none;width: 100%">\n' +
    '      </a>\n' +
    '    </div>\n' +
    '\n' +
    '\n' +
    '    <br/><br/>\n' +
    '    <hr>\n' +
    '\n' +
    '    <h3>Installing the Angular Material Libraries</h3>\n' +
    '\n' +
    '    <p>\n' +
    '      You can install the Angular Material library (and its dependent libraries) in your local\n' +
    '      project using either\n' +
    '      <a href="https://github.com/angular/bower-material/#installing-angular-material"\n' +
    '         target="_blank">NPM, JSPM, or Bower</a>.\n' +
    '    </p>\n' +
    '\n' +
    '    <p>\n' +
    '      Angular Material also integrates with some additional, optional libraries which you may elect\n' +
    '      to include:\n' +
    '    </p>\n' +
    '\n' +
    '    <ul style="margin-bottom: 2em;">\n' +
    '      <li>\n' +
    '        <a href="https://docs.angularjs.org/api/ngMessages">ngMessages</a>\n' +
    '        - Provides a consistent mechanism for displaying form errors and other messages.\n' +
    '      </li>\n' +
    '      <li>\n' +
    '        <a href="https://docs.angularjs.org/api/ngSanitize">ngSanitize</a>\n' +
    '        - The ngSanitize module provides functionality to sanitize HTML content in Material\n' +
    '        components.\n' +
    '      </li>\n' +
    '\n' +
    '      <li>\n' +
    '        <a href="https://docs.angularjs.org/api/ngRoute">ngRoute</a>\n' +
    '        - Provides a clean routing system for your application.\n' +
    '      </li>\n' +
    '    </ul>\n' +
    '\n' +
    '    <br/>\n' +
    '    <hr>\n' +
    '\n' +
    '    <h3>Unsupported Integrations</h3>\n' +
    '    <p>\n' +
    '      Angular Material v1.0 has known integration issues with the following libraries:\n' +
    '    </p>\n' +
    '    <ul style="margin-bottom: 2em;">\n' +
    '      <li>\n' +
    '        <a href="https://docs.angularjs.org/api/ngTouch">ngTouch</a>\n' +
    '        - ngMaterial conflicts with ngTouch for click, tap, and swipe support on touch-enabled\n' +
    '        devices.\n' +
    '      </li>\n' +
    '\n' +
    '      <li>\n' +
    '        <a href="http://ionicframework.com/">Ionic</a>\n' +
    '        - Open-source SDK for developing hybrid mobile apps with Web technologies has touch support\n' +
    '        that interferes with ngMaterial\'s mobile gesture features.\n' +
    '      </li>\n' +
    '    </ul>\n' +
    '\n' +
    '    <br/>\n' +
    '    <h2>Contributing to Angular Material</h2>\n' +
    '    <ul style="margin-bottom: 2em;">\n' +
    '      <li>\n' +
    '        Please read our <a href="https://github.com/angular/material#contributing">contributor\n' +
    '        guidelines</a>.\n' +
    '      </li>\n' +
    '\n' +
    '      <li>\n' +
    '        To contribute, fork our GitHub <a href="https://github.com/angular/material">repository</a>.\n' +
    '      </li>\n' +
    '\n' +
    '      <li>\n' +
    '        For problems,\n' +
    '        <a href="https://github.com/angular/material/issues?q=is%3Aissue+is%3Aopen"\n' +
    '           target="_blank">search the GitHub Issues</a> and/or\n' +
    '        <a href="https://github.com/angular/material/issues/new"\n' +
    '           target="_blank">create a New Issue</a>.\n' +
    '      </li>\n' +
    '\n' +
    '      <li>For questions,\n' +
    '        <a href="https://groups.google.com/forum/#!forum/ngmaterial"\n' +
    '           target="_blank">search the Forum</a> and/or post a new question.\n' +
    '      </li>\n' +
    '\n' +
    '      <li>\n' +
    '        Join the <a href="https://gitter.im/angular/material" target="_blank">Gitter Chat</a>.\n' +
    '      </li>\n' +
    '    </ul>\n' +
    '  </md-content>\n' +
    '</div>\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/home.tmpl.html',
    '<div ng-controller="HomeCtrl" class="doc-content">\n' +
    '  <md-content>\n' +
    '    <h2 class="md-headline" style="margin-top: 0;">What is Angular Material?</h2>\n' +
    '    <p>\n' +
    '      For developers using AngularJS, Angular Material is both a UI Component framework and a reference implementation of Google\'s\n' +
    '      Material Design Specification. This project provides a set of reusable, well-tested, and\n' +
    '      accessible UI components based on Material Design.\n' +
    '    </p>\n' +
    '    <ul class="buckets" layout layout-align="center center" layout-wrap>\n' +
    '      <li flex="50" flex-gt-md="25" ng-repeat="(index, link) in [\n' +
    '        { href: \'./getting-started\', icon: \'school\', text: \'Getting Started\' },\n' +
    '        { href: \'./contributors\', icon: \'school\', text: \'Contributors\' },\n' +
    '        { href: \'./demo\', icon: \'play_circle_fill\', text: \'Demos\' },\n' +
    '        { href: \'./CSS/typography\', icon: \'build\', text: \'Customization\' },\n' +
    '        { href: \'./api\', icon: \'code\', text: \'API Reference\' }\n' +
    '      ]">\n' +
    '        <md-button\n' +
    '            class="md-primary md-raised"\n' +
    '            ng-href="{{link.href}}"\n' +
    '            aria-label="{{link.text}}">\n' +
    '          <md-icon class="block" md-svg-src="img/icons/ic_{{link.icon}}_24px.svg"></md-icon>\n' +
    '          {{link.text}}\n' +
    '        </md-button>\n' +
    '      </li>\n' +
    '    </ul>\n' +
    '\n' +
    '    <br/>\n' +
    '    <h2 class="md-headline">What about Angular 2?</h2>\n' +
    '    <p>\n' +
    '      Angular Material recently released Version 1 which we consider to be stable and ready for\n' +
    '      production use. Developers should note that Angular Material v1 works only with Angular 1.x.\n' +
    '    </p>\n' +
    '    <ul>\n' +
    '      <li>Current Angular Material v1.x development efforts are focused on bug fixes and minor improvements.</li>\n' +
    '      <li>Angular Material v2 development is also in-progress at the <a href="https://github.com/angular/material2">angular/material2</a> GitHub repository.</li>\n' +
    '    </ul>\n' +
    '    <p>\n' +
    '      Please refer to our changelog for up-to-date listings of all v1.x improvements and breaking changes.\n' +
    '    </p>\n' +
    '     <ul class="buckets" layout layout-align="center center" layout-wrap>\n' +
    '      <li flex="100" flex-gt-xs="50" ng-repeat="(index, link) in [\n' +
    '        {\n' +
    '          href: \'https://github.com/angular/material/blob/master/CHANGELOG.md\',\n' +
    '          icon: \'access_time\',\n' +
    '          text: \'Changelog\'\n' +
    '        }\n' +
    '      ]">\n' +
    '        <md-button\n' +
    '            class="md-primary md-raised"\n' +
    '            ng-href="{{link.href}}"\n' +
    '            aria-label="{{link.text}}">\n' +
    '          <md-icon class="block" md-svg-src="img/icons/ic_{{link.icon}}_24px.svg"></md-icon>\n' +
    '          {{link.text}}<br/>\n' +
    '          <div style="text-transform: none;margin-top:-15px;font-size:1.0em;">Angular Material v1.x </div>\n' +
    '        </md-button>\n' +
    '      </li>\n' +
    '    </ul>\n' +
    '\n' +
    '    <md-divider></md-divider>\n' +
    '\n' +
    '    <br/>\n' +
    '    <h2 class="md-headline">Training Videos:</h2>\n' +
    '    <p>\n' +
    '      Here are some video courses that will help jump start your development with Angular Material.\n' +
    '    </p>\n' +
    '    <ul class="buckets" layout layout-align="center center" layout-wrap>\n' +
    '      <li flex="100" flex-gt-xs="50" ng-repeat="(index, link) in [\n' +
    '        { href: \'https://egghead.io/series/angular-material-introduction\', icon: \'ondemand_video\', text: \'Introduction to Angular Material\', site : \'EggHead\', access : \'free\'},\n' +
    '        { href: \'https://app.pluralsight.com/player?author=ajden-towfeek&name=angular-material-fundamentals-m0&mode=live&clip=0&course=angular-material-fundamentals\', icon: \'ondemand_video\', text: \'Angular Material Fundamentals\', site : \'Pluralsight\', access: \'member\'},\n' +
    '      ]">\n' +
    '        <md-button\n' +
    '            class="md-primary md-raised"\n' +
    '            target="_blank"\n' +
    '            aria-label="{{link.text}}"\n' +
    '            ng-href="{{link.href}}">\n' +
    '          <md-icon class="block" md-svg-src="img/icons/ic_{{link.icon}}_24px.svg"></md-icon>\n' +
    '          {{link.site}} | <span style="color: rgb(255,82,82); text-transform: none;">{{link.text}}</span> | <span class="training_info">{{link.access}}</span>\n' +
    '        </md-button>\n' +
    '      </li>\n' +
    '    </ul>\n' +
    '\n' +
    '\n' +
    '    <br/>\n' +
    '    <h2 class="md-headline">Conference Presentations:</h2>\n' +
    '    <p>\n' +
    '      Here are some conference presentations that will provide overviews for your development with Angular Material.\n' +
    '    </p>\n' +
    '    <ul class="buckets" layout layout-align="center center" layout-wrap>\n' +
    '      <li flex="100" flex-gt-xs="50" ng-repeat="(index, link) in [\n' +
    '        { href: \'https://www.youtube.com/watch?v=Qi31oO5u33U\', icon: \'ondemand_video\', text: \'Building with Angular Material\', site : \'ng-conf\',  date: \'2015\'},\n' +
    '        { href: \'https://www.youtube.com/watch?v=363o4i0rdvU\', icon: \'ondemand_video\', text: \'Angular Material in Practice\', site : \'AngularConnect\', date:\'2015\'},\n' +
    '      ]">\n' +
    '        <md-button\n' +
    '            class="md-primary md-raised"\n' +
    '            target="_blank"\n' +
    '            aria-label="{{link.text}}"\n' +
    '            ng-href="{{link.href}}">\n' +
    '          <md-icon class="block" md-svg-src="img/icons/ic_{{link.icon}}_24px.svg"></md-icon>\n' +
    '          <span class="training_site">{{link.site}}</span> | <span class="training_link">{{link.text}}</span> | <span class="training_info">{{link.date}}</span>\n' +
    '        </md-button>\n' +
    '      </li>\n' +
    '    </ul>\n' +
    '\n' +
    '\n' +
    '    <br/>\n' +
    '    <h2 class="md-headline">Google\'s Material Design</h2>\n' +
    '    <p>\n' +
    '      Material Design is a specification for a unified system of visual, motion, and interaction\n' +
    '      design that adapts across different devices and different screen sizes.\n' +
    '    </p>\n' +
    '    <ul class="buckets" layout layout-align="center center" layout-wrap>\n' +
    '      <li flex="100" flex-gt-xs="50" ng-repeat="(index, link) in [\n' +
    '        { href: \'https://www.youtube.com/watch?v=Q8TXgCzxEnw\', icon: \'ondemand_video\', text: \'Watch a video\', site : \'Google\' },\n' +
    '        { href: \'http://www.google.com/design/spec/material-design/\', icon: \'launch\', text: \'Learn More\', site : \'Google\' }\n' +
    '      ]">\n' +
    '        <md-button\n' +
    '            class="md-primary md-raised"\n' +
    '            target="_blank"\n' +
    '            aria-label="{{link.text}}"\n' +
    '            ng-href="{{link.href}}">\n' +
    '          <md-icon class="block" md-svg-src="img/icons/ic_{{link.icon}}_24px.svg"></md-icon>\n' +
    '          {{link.site}} | <span class="training_link"> {{link.text}} </span>\n' +
    '        </md-button>\n' +
    '      </li>\n' +
    '    </ul>\n' +
    '\n' +
    '    <br/>\n' +
    '    <p class="md-caption" style="text-align: center; margin-bottom: 0;">\n' +
    '      These docs were generated from\n' +
    '      (<a ng-href="{{BUILDCONFIG.repository}}/{{menu.version.current.github}}" target="_blank" class="md-accent" >\n' +
    '      v{{BUILDCONFIG.version}} - SHA {{BUILDCONFIG.commit.substring(0,7)}}</a>)\n' +
    '      on (<strong>{{BUILDCONFIG.date}}</strong>) GMT.\n' +
    '    </p>\n' +
    '  </md-content>\n' +
    '</div>\n' +
    '\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/layout-alignment.tmpl.html',
    '<div ng-controller="LayoutCtrl" class="layout-content" ng-cloak>\n' +
    '\n' +
    '  <p>\n' +
    '    The <code>layout-align</code> directive takes two words.\n' +
    '    The first word says how the children will be aligned in the layout\'s direction, and the second word says how the children will be aligned perpendicular to the layout\'s direction.</p>\n' +
    '\n' +
    '    <p>Only one value is required for this directive.\n' +
    '    For example, <code>layout="row" layout-align="center"</code> would make the elements\n' +
    '    center horizontally and use the default behavior vertically.</p>\n' +
    '\n' +
    '    <p><code>layout="column" layout-align="center end"</code> would make\n' +
    '    children align along the center vertically and along the end (right) horizontally. </p>\n' +
    '\n' +
    '\n' +
    '  <table class="md-api-table">\n' +
    '         <thead>\n' +
    '           <tr>\n' +
    '             <th>API</th>\n' +
    '             <th>Sets child alignments within the layout container</th>\n' +
    '           </tr>\n' +
    '         </thead>\n' +
    '          <tr>\n' +
    '            <td>layout-align</td>\n' +
    '            <td>Sets default alignment unless overridden by another breakpoint.</td>\n' +
    '          </tr>\n' +
    '          <tr>\n' +
    '           <td>layout-align-xs</td>\n' +
    '           <td>width &lt; <b>600</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>layout-align-gt-xs</td>\n' +
    '           <td>width &gt;= <b>600</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>layout-align-sm</td>\n' +
    '           <td><b>600</b>px &lt;= width &lt; <b>960</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>layout-align-gt-sm</td>\n' +
    '           <td>width &gt;= <b>960</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>layout-align-md</td>\n' +
    '           <td><b>960</b>px &lt;= width &lt; <b>1280</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>layout-align-gt-md</td>\n' +
    '           <td>width &gt;= <b>1280</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>layout-align-lg</td>\n' +
    '           <td><b>1280</b>px &lt;= width &lt; <b>1920</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>layout-align-gt-lg</td>\n' +
    '           <td>width &gt;= <b>1920</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>layout-align-xl</td>\n' +
    '           <td>width &gt;= <b>1920</b>px</td>\n' +
    '         </tr>\n' +
    '        </table>\n' +
    '\n' +
    '  <br/>\n' +
    '\n' +
    '  <p>\n' +
    '   Below is an interactive demo that lets you explore the visual results of the different settings:\n' +
    '  </p>\n' +
    '\n' +
    '  <div>\n' +
    '    <docs-demo demo-title=\'layout="{{layoutDemo.direction}}" &nbsp; &nbsp; &nbsp; layout-align="{{layoutAlign()}}"\'\n' +
    '               class="small-demo colorNested" interpolate-code="true">\n' +
    '      <demo-file name="index.html">\n' +
    '        <div layout="{{layoutDemo.direction}}" layout-align="{{layoutAlign()}}">\n' +
    '          <div>one</div>\n' +
    '          <div>two</div>\n' +
    '          <div>three</div>\n' +
    '        </div>\n' +
    '      </demo-file>\n' +
    '    </docs-demo>\n' +
    '  </div>\n' +
    '\n' +
    '  <div layout="column" layout-gt-sm="row" layout-align="space-around">\n' +
    '\n' +
    '    <div>\n' +
    '      <md-subheader>Layout Direction</md-subheader>\n' +
    '      <md-radio-group ng-model="layoutDemo.direction">\n' +
    '        <md-radio-button value="row">row</md-radio-button>\n' +
    '        <md-radio-button value="column">column</md-radio-button>\n' +
    '      </md-radio-group>\n' +
    '    </div>\n' +
    '    <div>\n' +
    '      <md-subheader>Alignment in Layout Direction ({{layoutDemo.direction == \'row\' ? \'horizontal\' : \'vertical\'}})</md-subheader>\n' +
    '      <md-radio-group ng-model="layoutDemo.mainAxis">\n' +
    '        <md-radio-button value="">none</md-radio-button>\n' +
    '        <md-radio-button value="start">start (default)</md-radio-button>\n' +
    '        <md-radio-button value="center">center</md-radio-button>\n' +
    '        <md-radio-button value="end">end</md-radio-button>\n' +
    '        <md-radio-button value="space-around">space-around</md-radio-button>\n' +
    '        <md-radio-button value="space-between">space-between</md-radio-button>\n' +
    '      </md-radio-group>\n' +
    '    </div>\n' +
    '    <div>\n' +
    '      <md-subheader>Alignment in Perpendicular Direction ({{layoutDemo.direction == \'column\' ? \'horizontal\' : \'vertical\'}})</md-subheader>\n' +
    '      <md-radio-group ng-model="layoutDemo.crossAxis">\n' +
    '        <md-radio-button value="none"><em>none</em></md-radio-button>\n' +
    '        <md-radio-button value="start">start</md-radio-button>\n' +
    '        <md-radio-button value="center">center</md-radio-button>\n' +
    '        <md-radio-button value="end">end</md-radio-button>\n' +
    '        <md-radio-button value="stretch">stretch (default)</md-radio-button>\n' +
    '      </md-radio-group>\n' +
    '    </div>\n' +
    '\n' +
    '  </div>\n' +
    '</div>\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/layout-children.tmpl.html',
    '<div ng-controller="LayoutCtrl" class="layout-content" ng-cloak>\n' +
    '\n' +
    '  <h3>Children within a Layout Container</h3>\n' +
    '\n' +
    '  <p>\n' +
    '    To customize the size and position of elements in a layout <b>container</b>, use the\n' +
    '    <code>flex</code>, <code>flex-order</code>, and <code>flex-offset</code> attributes on the container\'s <u>child</u> elements:\n' +
    '  </p>\n' +
    '\n' +
    '  <docs-demo demo-title="Flex Directive" class="small-demo colorNested">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="row">\n' +
    '        <div flex="20">\n' +
    '          [flex="20"]\n' +
    '        </div>\n' +
    '        <div flex="70">\n' +
    '          [flex="70"]\n' +
    '        </div>\n' +
    '        <div flex hide-sm hide-xs>\n' +
    '          [flex]\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '  <p>\n' +
    '    Add the <code>flex</code> directive to a layout\'s child element and the element will flex (grow or shrink) to fit\n' +
    '    the area unused by other elements. <code>flex</code> defines how the element will adjust its size with respect to its\n' +
    '    <u>parent</u> container and the other elements within the container.\n' +
    '  </p>\n' +
    '\n' +
    '  <docs-demo demo-title="Flex Percent Values" class="small-demo colorNested-noPad">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="row" layout-wrap>\n' +
    '        <div flex="30">\n' +
    '          [flex="30"]\n' +
    '        </div>\n' +
    '        <div flex="45">\n' +
    '          [flex="45"]\n' +
    '        </div>\n' +
    '        <div flex="25">\n' +
    '          [flex="25"]\n' +
    '        </div>\n' +
    '        <div flex="33">\n' +
    '          [flex="33"]\n' +
    '        </div>\n' +
    '        <div flex="66">\n' +
    '          [flex="66"]\n' +
    '        </div>\n' +
    '        <div flex="50">\n' +
    '          [flex="50"]\n' +
    '        </div>\n' +
    '        <div flex>\n' +
    '          [flex]\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '\n' +
    '  <p>\n' +
    '    A layout child\'s <code>flex</code> directive can be given an integer value from 0-100.\n' +
    '    The element will stretch to the percentage of available space matching the value. Currently, the <code>flex</code>\n' +
    '    directive value is restricted to multiples of five, 33 or 66.\n' +
    '  </p>\n' +
    '\n' +
    '  <p> For example: <code>flex="5", flex="20", flex="33", flex="50", flex="66", flex="75", ... flex="100"</code>.</p>\n' +
    '\n' +
    '  <docs-demo demo-title="Responsive Flex Directives" class="small-demo colorNested-noPad">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="row">\n' +
    '        <div flex-gt-sm="66" flex="33">\n' +
    '          flex 33% on mobile, <br/>and 66% on gt-sm devices.\n' +
    '        </div>\n' +
    '        <div flex-gt-sm="33" flex="66">\n' +
    '          flex 66%  on mobile, <br/>and 33% on gt-sm devices.\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '\n' +
    '  <p>\n' +
    '    See the <a href="layout/options">layout options page</a> for more information on responsive flex directives like\n' +
    '    <code>hide-sm</code> and <code>layout-wrap</code> used in the above examples.\n' +
    '  </p>\n' +
    '\n' +
    '  <br/>\n' +
    '  <hr>\n' +
    '  <br/>\n' +
    '\n' +
    '  <h3>Additional Flex Values</h3>\n' +
    '\n' +
    '  <p>\n' +
    '    There are additional flex values provided by Angular Material to improve flexibility and to make the API\n' +
    '    easier to understand.\n' +
    '  </p>\n' +
    '\n' +
    '  <docs-demo demo-title="Other Flex Values" class="small-demo colorNested-noPad">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="row" layout-wrap>\n' +
    '        <div flex="none">\n' +
    '          [flex="none"]\n' +
    '        </div>\n' +
    '        <div flex>\n' +
    '          [flex]\n' +
    '        </div>\n' +
    '        <div flex="nogrow">\n' +
    '          [flex="nogrow"]\n' +
    '        </div>\n' +
    '        <div flex="grow">\n' +
    '          [flex="grow"]\n' +
    '        </div>\n' +
    '        <div flex="initial">\n' +
    '          [flex="initial"]\n' +
    '        </div>\n' +
    '        <div flex="auto">\n' +
    '          [flex="auto"]\n' +
    '        </div>\n' +
    '        <div flex="noshrink">\n' +
    '          [flex="noshrink"]\n' +
    '        </div>\n' +
    '        <div flex="0">\n' +
    '          [flex="0"]\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '\n' +
    '  <table class="md-api-table">\n' +
    '    <tr>\n' +
    '      <td>flex</td>\n' +
    '      <td>\n' +
    '        Will grow and shrink as needed. Starts with a size of 0%. Same as <code>flex="0"</code>.\n' +
    '        <br />\n' +
    '        <br />\n' +
    '        <b>Note:</b> There is a known bug with this attribute in IE11 when the parent container has\n' +
    '        no explicit height set. See our\n' +
    '        <a ng-href="layout/tips#layout-column-0px-ie11">Troubleshooting</a> page for more info.\n' +
    '      </td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>flex="none"</td>\n' +
    '      <td>Will not grow or shrink. Sized based on its <code>width</code> and <code>height</code> values.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>flex="initial"</td>\n' +
    '      <td>Will shrink as needed. Starts with a size based on its <code>width</code> and <code>height</code> values.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>flex="auto"</td>\n' +
    '      <td>Will grow and shrink as needed. Starts with a size based on its <code>width</code> and <code>height</code> values.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>flex="grow"</td>\n' +
    '      <td>Will grow and shrink as needed. Starts with a size of 100%. Same as <code>flex="100"</code>.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>flex="nogrow"</td>\n' +
    '      <td>Will shrink as needed, but won\'t grow. Starts with a size based on its <code>width</code> and <code>height</code> values.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>flex="noshrink"</td>\n' +
    '      <td>Will grow as needed, but won\'t shrink. Starts with a size based on its <code>width</code> and <code>height</code> values.</td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '\n' +
    '\n' +
    '  <br/>\n' +
    '  <hr>\n' +
    '  <br/>\n' +
    '\n' +
    '  <h3>Ordering HTML Elements</h3>\n' +
    '\n' +
    '  <p>\n' +
    '    Add the <code>flex-order</code> directive to a layout child to set its\n' +
    '    order position within the layout container. Any integer value from -20 to 20 is accepted.\n' +
    '  </p>\n' +
    '\n' +
    '  <docs-demo demo-title="Flex-Order Directive" class="small-demo colorNested">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="row">\n' +
    '        <div flex flex-order="-1">\n' +
    '          <p>[flex-order="-1"]</p>\n' +
    '        </div>\n' +
    '        <div flex flex-order="1" flex-order-gt-md="3">\n' +
    '          <p hide-gt-md>[flex-order="1"]</p>\n' +
    '          <p hide show-gt-md>[flex-order-gt-md="3"]</p>\n' +
    '        </div>\n' +
    '        <div flex flex-order="2">\n' +
    '          <p>[flex-order="2"]</p>\n' +
    '        </div>\n' +
    '        <div flex flex-order="3" flex-order-gt-md="1">\n' +
    '          <p hide-gt-md>[flex-order="3"]</p>\n' +
    '          <p hide show-gt-md>[flex-order-gt-md="1"]</p>\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '  <table class="md-api-table">\n' +
    '      <thead>\n' +
    '        <tr>\n' +
    '          <th>API</th>\n' +
    '          <th>Device <b>width</b> when breakpoint overrides default</th>\n' +
    '        </tr>\n' +
    '      </thead>\n' +
    '       <tr>\n' +
    '         <td>flex-order</td>\n' +
    '         <td>Sets default layout order unless overridden by another breakpoint.</td>\n' +
    '       </tr>\n' +
    '    <tr>\n' +
    '        <td>flex-order-xs</td>\n' +
    '           <td>width &lt; <b>600</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-order-gt-xs</td>\n' +
    '           <td>width &gt;= <b>600</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-order-sm</td>\n' +
    '           <td><b>600</b>px &lt;= width &lt; <b>960</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-order-gt-sm</td>\n' +
    '           <td>width &gt;= <b>960</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-order-md</td>\n' +
    '           <td><b>960</b>px &lt;= width &lt; <b>1280</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-order-gt-md</td>\n' +
    '           <td>width &gt;= <b>1280</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-order-lg</td>\n' +
    '           <td><b>1280</b>px &lt;= width &lt; <b>1920</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-order-gt-lg</td>\n' +
    '           <td>width &gt;= <b>1920</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-order-xl</td>\n' +
    '           <td>width &gt;= <b>1920</b>px</td>\n' +
    '         </tr>\n' +
    '     </table>\n' +
    '\n' +
    '\n' +
    '  <p>\n' +
    '    See the <a href="layout/options">layout options page</a> for more information on directives like\n' +
    '    <code>hide</code>, <code>hide-gt-md</code>, and <code>show-gt-md</code> used in the above examples.\n' +
    '  </p>\n' +
    '\n' +
    '  <br/>\n' +
    '  <hr>\n' +
    '  <br/>\n' +
    '\n' +
    '  <h3>Add Offsets to the Preceding HTML Elements</h3>\n' +
    '\n' +
    '  <p>\n' +
    '    Add the <code>flex-offset</code> directive to a layout child to set its\n' +
    '    offset percentage within the layout container. Values must be multiples\n' +
    '    of <code>5</code> or <code>33</code> / <code>66</code>. These offsets establish a <code>margin-left</code>\n' +
    '    with respect to the preceding element or the containers left boundary.\n' +
    '  </p>\n' +
    '\n' +
    '  <p>\n' +
    '      When using <code>flex-offset</code> the margin-left offset is applied... regardless of your choice of <code>flex-order</code>.\n' +
    '      or if you use a <code>flex-direction: reverse</code>.\n' +
    '    </p>\n' +
    '\n' +
    '  <docs-demo demo-title="Flex-Offset Directive" class="small-demo colorNested">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="row">\n' +
    '        <div flex="66" flex-offset="15">\n' +
    '          [flex-offset="15"]\n' +
    '          [flex="66"]\n' +
    '        </div>\n' +
    '        <div flex>\n' +
    '          [flex]\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '  <table class="md-api-table">\n' +
    '        <thead>\n' +
    '          <tr>\n' +
    '            <th>API</th>\n' +
    '            <th>Device width when breakpoint overrides default</th>\n' +
    '          </tr>\n' +
    '        </thead>\n' +
    '         <tr>\n' +
    '           <td>flex-offset</td>\n' +
    '           <td>Sets default margin-left offset (<b>%-based</b>) unless overridden by another breakpoint.</td>\n' +
    '         </tr>\n' +
    '    <tr>\n' +
    '           <td>flex-offset-xs</td>\n' +
    '           <td>width &lt; <b>600</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-offset-gt-xs</td>\n' +
    '           <td>width &gt;= <b>600</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-offset-sm</td>\n' +
    '           <td><b>600</b>px &lt;= width &lt; <b>960</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-offset-gt-sm</td>\n' +
    '           <td>width &gt;= <b>960</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-offset-md</td>\n' +
    '           <td><b>960</b>px &lt;= width &lt; <b>1280</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-offset-gt-md</td>\n' +
    '           <td>width &gt;= <b>1280</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-offset-lg</td>\n' +
    '           <td><b>1280</b>px &lt;= width &lt; <b>1920</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-offset-gt-lg</td>\n' +
    '           <td>width &gt;= <b>1920</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-offset-xl</td>\n' +
    '           <td>width &gt;= <b>1920</b>px</td>\n' +
    '         </tr>\n' +
    '       </table>\n' +
    '\n' +
    '\n' +
    '</div>\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/layout-container.tmpl.html',
    '<div ng-controller="LayoutCtrl" class="layout-content" ng-cloak>\n' +
    '\n' +
    '  <h3>Layout and Containers</h3>\n' +
    '\n' +
    '  <p>\n' +
    '    Use the <code>layout</code> directive on a container element to specify the layout direction for its children:\n' +
    '    horizontally in a row (<code>layout="row"</code>) or vertically in a column (<code>layout="column"</code>).\n' +
    '    Note that <code>row</code> is the default layout direction if you specify the <code>layout</code> directive without a value.\n' +
    '  </p>\n' +
    '\n' +
    '  <table>\n' +
    '    <tr>\n' +
    '      <td style="font-weight: bold; background-color: #DBEEF5">row</td>\n' +
    '      <td style="padding-left: 10px;">Items arranged horizontally. <code>max-height = 100%</code> and <code>max-width</code>  is the width of the items in the container.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td style="font-weight: bold; background-color: #DBEEF5 ">column</td>\n' +
    '      <td style="padding-left: 10px;">Items arranged vertically. <code>max-width = 100%</code>  and <code>max-height</code> is the height of the items in the container.</td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '\n' +
    '  <br/>\n' +
    '\n' +
    '  <docs-demo demo-title="Layout Directive" class="small-demo colorNested">\n' +
    '    <demo-file name="index.html">\n' +
    '    <div layout="row">\n' +
    '      <div flex>First item in row</div>\n' +
    '      <div flex>Second item in row</div>\n' +
    '    </div>\n' +
    '    <div layout="column">\n' +
    '      <div flex>First item in column</div>\n' +
    '      <div flex>Second item in column</div>\n' +
    '    </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '  <p>\n' +
    '      Note that <code>layout</code> only affects the flow direction for that container\'s <b>immediate</b> children.\n' +
    '    </p>\n' +
    '\n' +
    '  <hr>\n' +
    '\n' +
    '  <br/>\n' +
    '  <h3>Layouts and Responsive Breakpoints</h3>\n' +
    '\n' +
    '  <p>\n' +
    '    As discussed in the <a href="layout/introduction">Layout Introduction page</a> you can\n' +
    '    make your layout change depending upon the device view size by using <b>breakpoint alias</b> suffixes.\n' +
    '   </p>\n' +
    '\n' +
    '  <p>\n' +
    '    To make your layout automatically change depending upon the device screen size, use one to the following <code>layout</code>\n' +
    '    APIs to set the layout direction for devices with view widths:\n' +
    '  </p>\n' +
    '\n' +
    '   <table class="md-api-table">\n' +
    '    <thead>\n' +
    '      <tr>\n' +
    '        <th>API</th>\n' +
    '        <th>Device width when breakpoint overrides default</th>\n' +
    '      </tr>\n' +
    '    </thead>\n' +
    '     <tr>\n' +
    '       <td>layout</td>\n' +
    '       <td>Sets default layout direction unless overridden by another breakpoint.</td>\n' +
    '     </tr>\n' +
    '     <tr>\n' +
    '       <td>layout-xs</td>\n' +
    '       <td>width &lt; <b>600</b>px</td>\n' +
    '     </tr>\n' +
    '     <tr>\n' +
    '       <td>layout-gt-xs</td>\n' +
    '       <td>width &gt;= <b>600</b>px</td>\n' +
    '     </tr>\n' +
    '     <tr>\n' +
    '       <td>layout-sm</td>\n' +
    '       <td><b>600</b>px &lt;= width &lt; <b>960</b>px</td>\n' +
    '     </tr>\n' +
    '     <tr>\n' +
    '       <td>layout-gt-sm</td>\n' +
    '       <td>width &gt;= <b>960</b>px</td>\n' +
    '     </tr>\n' +
    '     <tr>\n' +
    '       <td>layout-md</td>\n' +
    '       <td><b>960</b>px &lt;= width &lt; <b>1280</b>px</td>\n' +
    '     </tr>\n' +
    '     <tr>\n' +
    '       <td>layout-gt-md</td>\n' +
    '       <td>width &gt;= <b>1280</b>px</td>\n' +
    '     </tr>\n' +
    '     <tr>\n' +
    '       <td>layout-lg</td>\n' +
    '       <td><b>1280</b>px &lt;= width &lt; <b>1920</b>px</td>\n' +
    '     </tr>\n' +
    '     <tr>\n' +
    '       <td>layout-gt-lg</td>\n' +
    '       <td>width &gt;= <b>1920</b>px</td>\n' +
    '     </tr>\n' +
    '     <tr>\n' +
    '       <td>layout-xl</td>\n' +
    '       <td>width &gt;= <b>1920</b>px</td>\n' +
    '     </tr>\n' +
    '   </table>\n' +
    '   <br/>\n' +
    '\n' +
    '  <p><a\n' +
    '      href="https://camo.githubusercontent.com/ad81ae92f8b4285747ce4e48007bf3f104dd5630/687474703a2f2f6d6174657269616c2d64657369676e2e73746f726167652e676f6f676c65617069732e636f6d2f7075626c6973682f6d6174657269616c5f765f342f6d6174657269616c5f6578745f7075626c6973682f3042386f6c5631354a3761625053474678656d46695156527462316b2f6c61796f75745f61646170746976655f627265616b706f696e74735f30312e706e67"\n' +
    '      target="_blank" style="text-decoration: none;border: 0 none;">\n' +
    '      <img\n' +
    '      src="https://camo.githubusercontent.com/ad81ae92f8b4285747ce4e48007bf3f104dd5630/687474703a2f2f6d6174657269616c2d64657369676e2e73746f726167652e676f6f676c65617069732e636f6d2f7075626c6973682f6d6174657269616c5f765f342f6d6174657269616c5f6578745f7075626c6973682f3042386f6c5631354a3761625053474678656d46695156527462316b2f6c61796f75745f61646170746976655f627265616b706f696e74735f30312e706e67"\n' +
    '      alt=""\n' +
    '      style="max-width:100%;text-decoration: none;border: 0 none;"></a>\n' +
    '  </p>\n' +
    '\n' +
    '\n' +
    '  <p>\n' +
    '    For the demo below, as you shrink your browser window width notice the flow direction changes to <code>column</code>\n' +
    '    for mobile devices (<code>xs</code>). And as you expand it will reset to <code>row</code>\n' +
    '    for <code>gt-sm</code> view sizes.\n' +
    '\n' +
    '  </p>\n' +
    '\n' +
    '  <docs-demo demo-title="Responsive Layouts" class="small-demo colorNested">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="row" layout-xs="column">\n' +
    '        <div flex>\n' +
    '          I\'m above on mobile, and to the left on larger devices.\n' +
    '        </div>\n' +
    '        <div flex>\n' +
    '          I\'m below on mobile, and to the right on larger devices.\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '\n' +
    '\n' +
    '  <p>\n' +
    '    See the <a href="layout/options">Layout Options page</a> for more options such as padding, alignments, etc.\n' +
    '  </p>\n' +
    '\n' +
    '\n' +
    '\n' +
    ' </div>\n' +
    '\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/layout-introduction.tmpl.html',
    '<div ng-controller="LayoutCtrl" class="layout-content" ng-cloak>\n' +
    '\n' +
    '  <h3>Overview</h3>\n' +
    '  <p>\n' +
    '    Angular Material\'s Layout features provide sugar to enable developers to more easily create modern,\n' +
    '    responsive layouts on top of CSS3 <a href="http://www.w3.org/TR/css3-flexbox/">flexbox</a>.\n' +
    '    The layout API consists of a set of Angular directives that can\n' +
    '    be applied to any of your application\'s HTML content.\n' +
    '  </p>\n' +
    '\n' +
    '\n' +
    '  <p>\n' +
    '    Using <b> HTML Directives</b> as the API provides an easy way to set a value (eg. <code>layout="row"</code>) and\n' +
    '    helps with separation of concerns: Attributes define layout while CSS classes assign styling.\n' +
    '  </p>\n' +
    '\n' +
    '\n' +
    '  <table class="md-api-table">\n' +
    '    <thead>\n' +
    '    <tr>\n' +
    '      <th>HTML Markup API</th>\n' +
    '      <th>Allowed values (raw or interpolated)</th>\n' +
    '    </tr>\n' +
    '    </thead>\n' +
    '    <tbody>\n' +
    '    <tr>\n' +
    '      <td>layout</td>\n' +
    '      <td><code>row | column</code></td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>flex</td>\n' +
    '      <td> integer (increments of 5 for 0%->100%, 100%/3, 200%/3)</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>flex-order</td>\n' +
    '      <td>integer values from -20 to 20</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>flex-offset</td>\n' +
    '      <td>integer (increments of 5 for 0%->95%, 100%/3, 200%/3)</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-align</td>\n' +
    '      <td><code>start|center|end|space-around|space-between</code> <code>start|center|end|stretch</code></td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-fill</td>\n' +
    '      <td></td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-wrap</td>\n' +
    '      <td></td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-nowrap</td>\n' +
    '      <td></td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-margin</td>\n' +
    '      <td></td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-padding</td>\n' +
    '      <td></td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>show</td>\n' +
    '      <td></td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>hide</td>\n' +
    '      <td></td>\n' +
    '    </tr>\n' +
    '    </tbody>\n' +
    '  </table>\n' +
    '\n' +
    '\n' +
    '  <p>And if we use Breakpoints as specified in Material Design:</p>\n' +
    '  <p><a\n' +
    '      href="https://camo.githubusercontent.com/ad81ae92f8b4285747ce4e48007bf3f104dd5630/687474703a2f2f6d6174657269616c2d64657369676e2e73746f726167652e676f6f676c65617069732e636f6d2f7075626c6973682f6d6174657269616c5f765f342f6d6174657269616c5f6578745f7075626c6973682f3042386f6c5631354a3761625053474678656d46695156527462316b2f6c61796f75745f61646170746976655f627265616b706f696e74735f30312e706e67"\n' +
    '      target="_blank"><img\n' +
    '      src="https://camo.githubusercontent.com/ad81ae92f8b4285747ce4e48007bf3f104dd5630/687474703a2f2f6d6174657269616c2d64657369676e2e73746f726167652e676f6f676c65617069732e636f6d2f7075626c6973682f6d6174657269616c5f765f342f6d6174657269616c5f6578745f7075626c6973682f3042386f6c5631354a3761625053474678656d46695156527462316b2f6c61796f75745f61646170746976655f627265616b706f696e74735f30312e706e67"\n' +
    '      alt=""\n' +
    '      style="max-width:100%;"></a>\n' +
    '  </p>\n' +
    '\n' +
    '\n' +
    '  <p>We can associate breakpoints with mediaQuery definitions using breakpoint <strong>alias(es)</strong>:</p>\n' +
    '\n' +
    '  <table class="md-api-table">\n' +
    '    <thead>\n' +
    '    <tr>\n' +
    '      <th>Breakpoint</th>\n' +
    '      <th>MediaQuery (pixel range)</th>\n' +
    '    </tr>\n' +
    '    </thead>\n' +
    '    <tbody>\n' +
    '    <tr>\n' +
    '      <td>xs</td>\n' +
    '      <td>\'(max-width: <b>599</b>px)\'</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>gt-xs</td>\n' +
    '      <td>\'(min-width: <b>600</b>px)\'</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>sm</td>\n' +
    '      <td>\'(min-width: <b>600</b>px) and (max-width: <b>959</b>px)\'</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>gt-sm</td>\n' +
    '      <td>\'(min-width: <b>960</b>px)\'</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>md</td>\n' +
    '      <td>\'(min-width: <b>960</b>px) and (max-width: <b>1279</b>px)\'</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>gt-md</td>\n' +
    '      <td>\'(min-width: <b>1280</b>px)\'</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>lg</td>\n' +
    '      <td>\'(min-width: <b>1280</b>px) and (max-width: <b>1919</b>px)\'</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>gt-lg</td>\n' +
    '      <td>\'(min-width: <b>1920</b>px)\'</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>xl</td>\n' +
    '      <td>\'(min-width: <b>1920</b>px)\'</td>\n' +
    '    </tr>\n' +
    '    </tbody>\n' +
    '  </table>\n' +
    '\n' +
    '  <br/>\n' +
    '  <hr>\n' +
    '  <h3>\n' +
    '    API with Responsive Breakpoints\n' +
    '  </h3>\n' +
    '\n' +
    '  <p>Now we can combine the breakpoint <code>alias</code> with the Layout API to easily support Responsive breakpoints\n' +
    '    with our simple Layout markup convention. The <code>alias</code> is simply used as <b>suffix</b> extensions to the Layout\n' +
    '    API keyword.\n' +
    '    <br/>e.g.\n' +
    '  </p>\n' +
    '\n' +
    '  <p>\n' +
    '    This notation results in, for example, the following table for the <code>layout</code> and <code>flex</code> APIs:\n' +
    '  </p>\n' +
    '\n' +
    '  <table class="md-api-table">\n' +
    '      <thead>\n' +
    '      <tr>\n' +
    '        <th>layout API</th>\n' +
    '        <th>flex API</th>\n' +
    '        <th>Activates when device</th>\n' +
    '      </tr>\n' +
    '      </thead>\n' +
    '      <tr>\n' +
    '        <td>layout</td>\n' +
    '        <td>flex</td>\n' +
    '        <td>Sets default layout direction &amp; flex unless overridden by another breakpoint.</td>\n' +
    '      </tr>\n' +
    '      <tr>\n' +
    '        <td>layout-xs</td>\n' +
    '        <td>flex-xs</td>\n' +
    '        <td>width &lt; <b>600</b>px</td>\n' +
    '      </tr>\n' +
    '      <tr>\n' +
    '        <td>layout-gt-xs</td>\n' +
    '        <td>flex-gt-xs</td>\n' +
    '        <td>width &gt;= <b>600</b>px</td>\n' +
    '      </tr>\n' +
    '      <tr>\n' +
    '        <td>layout-sm</td>\n' +
    '        <td>flex-sm</td>\n' +
    '        <td><b>600</b>px &lt;= width &lt; <b>960</b>px</td>\n' +
    '      </tr>\n' +
    '      <tr>\n' +
    '        <td>layout-gt-sm</td>\n' +
    '        <td>flex-gt-sm</td>\n' +
    '        <td>width &gt;= <b>960</b>px</td>\n' +
    '      </tr>\n' +
    '      <tr>\n' +
    '        <td>layout-md</td>\n' +
    '        <td>flex-md</td>\n' +
    '        <td><b>960</b>px &lt;= width &lt; <b>1280</b>px</td>\n' +
    '      </tr>\n' +
    '      <tr>\n' +
    '        <td>layout-gt-md</td>\n' +
    '        <td>flex-gt-md</td>\n' +
    '        <td>width &gt;= <b>1280</b>px</td>\n' +
    '      </tr>\n' +
    '      <tr>\n' +
    '        <td>layout-lg</td>\n' +
    '        <td>flex-lg</td>\n' +
    '        <td><b>1280</b>px &lt;= width &lt; <b>1920</b>px</td>\n' +
    '      </tr>\n' +
    '      <tr>\n' +
    '        <td>layout-gt-lg</td>\n' +
    '        <td>flex-gt-lg</td>\n' +
    '        <td>width &gt;= <b>1920</b>px</td>\n' +
    '      </tr>\n' +
    '      <tr>\n' +
    '        <td>layout-xl</td>\n' +
    '        <td>flex-xl</td>\n' +
    '        <td>width &gt;= <b>1920</b>px</td>\n' +
    '      </tr>\n' +
    '    </table>\n' +
    '\n' +
    '  <p>Below is an example usage of the Responsive Layout API:</p>\n' +
    '\n' +
    '  <hljs lang="html">\n' +
    '    <div layout=\'column\' class="zero">\n' +
    '\n' +
    '      <div flex="33" flex-md="{{ vm.box1Width }}" class="one"></div>\n' +
    '      <div flex="33" layout="{{ vm.direction }}" layout-md="row" class="two">\n' +
    '\n' +
    '        <div flex="20" flex-md="10" hide-lg class="two_one"></div>\n' +
    '        <div flex="30px" show hide-md="{{ vm.hideBox }}" flex-md="25" class="two_two"></div>\n' +
    '        <div flex="20" flex-md="65" class="two_three"></div>\n' +
    '\n' +
    '      </div>\n' +
    '      <div flex class="three"></div>\n' +
    '\n' +
    '    </div>\n' +
    '  </hljs>\n' +
    '\n' +
    '  <br/>\n' +
    '\n' +
    '  <p>\n' +
    '  This Layout API means it is much easier to set up and maintain flexbox layouts vs. defining everything via CSS.\n' +
    '  The developer uses the Layout HTML API to specify <b><i>intention</i></b> and the Layout engine handles all the issues of CSS flexbox styling.\n' +
    '  </p>\n' +
    '\n' +
    '  <p class="layout_note">\n' +
    '    The Layout engine will log console warnings when it encounters conflicts or known issues.\n' +
    '  </p>\n' +
    '\n' +
    '\n' +
    '  <br/><br/>\n' +
    '  <hr>\n' +
    '  <br/>\n' +
    '\n' +
    '  <h3>Under-the-Hood</h3>\n' +
    '\n' +
    '  <p>\n' +
    '    Due to performance problems when using Attribute Selectors with <b>Internet Explorer</b> browsers; see the following for more details:\n' +
    '  </p>\n' +
    '\n' +
    '  <p>\n' +
    '    Layout directives dynamically generate class selectors at runtime. And the Layout CSS classNames and styles have each been\n' +
    '    predefined in the <code>angular-material.css</code> stylesheet.\n' +
    '  </p>\n' +
    '\n' +
    '  <p class="layout_note">\n' +
    '    Developers should continue to use Layout directives in the HTML\n' +
    '    markup as the classes may change between releases.\n' +
    '  </p>\n' +
    '\n' +
    '  <p>\n' +
    '    Let\'s see how this directive-to-className transformation works. Consider the simple use of the <code>layout</code> and <code>flex</code> directives (API):\n' +
    '  </p>\n' +
    '\n' +
    '  <hljs lang="html">\n' +
    '    <div>\n' +
    '\n' +
    '      <div layout="row">\n' +
    '\n' +
    '        <div flex>First item in row</div>\n' +
    '        <div flex="20">Second item in row</div>\n' +
    '\n' +
    '      </div>\n' +
    '      <div layout="column">\n' +
    '\n' +
    '        <div flex="66">First item in column</div>\n' +
    '        <div flex="33">Second item in column</div>\n' +
    '\n' +
    '      </div>\n' +
    '\n' +
    '    </div>\n' +
    '  </hljs>\n' +
    '\n' +
    '\n' +
    '  <p>\n' +
    '    At runtime, these attributes are transformed to CSS classes.\n' +
    '  </p>\n' +
    '\n' +
    '  <hljs lang="html">\n' +
    '    <div>\n' +
    '\n' +
    '      <div class="ng-scope layout-row">\n' +
    '\n' +
    '        <div class="flex">First item in row</div>\n' +
    '        <div class="flex-20">Second item in row</div>\n' +
    '\n' +
    '      </div>\n' +
    '      <div class="ng-scope layout-column">\n' +
    '\n' +
    '        <div class="flex-33">First item in column</div>\n' +
    '        <div class="flex-66">Second item in column</div>\n' +
    '\n' +
    '      </div>\n' +
    '\n' +
    '    </div>\n' +
    '  </hljs>\n' +
    '\n' +
    '  <p>\n' +
    '    Using the style classes above defined in <code>angular-material.css</code>\n' +
    '  </p>\n' +
    '\n' +
    '  <hljs lang="css">\n' +
    '\n' +
    '    .flex {\n' +
    '      -webkit-flex: 1 1 0%;\n' +
    '          -ms-flex: 1 1 0%;\n' +
    '              flex: 1 1 0%;\n' +
    '      box-sizing: border-box;\n' +
    '    }\n' +
    '    .flex-20 {\n' +
    '      -webkit-flex: 1 1 20%;\n' +
    '          -ms-flex: 1 1 20%;\n' +
    '              flex: 1 1 20%;\n' +
    '      max-width: 20%;\n' +
    '      max-height: 100%;\n' +
    '      box-sizing: border-box;\n' +
    '    }\n' +
    '\n' +
    '    .layout-row .flex-33 {\n' +
    '      -webkit-flex: 1 1 calc(100% / 3);\n' +
    '          -ms-flex: 1 1 calc(100% / 3);\n' +
    '              flex: 1 1 calc(100% / 3);\n' +
    '      box-sizing: border-box;\n' +
    '    }\n' +
    '\n' +
    '    .layout-row  .flex-66 {\n' +
    '      -webkit-flex: 1 1 calc(200% / 3);\n' +
    '          -ms-flex: 1 1 calc(200% / 3);\n' +
    '              flex: 1 1 calc(200% / 3);\n' +
    '      box-sizing: border-box;\n' +
    '    }\n' +
    '\n' +
    '\n' +
    '    .layout-row .flex-33 {\n' +
    '      max-width: calc(100% / 3);\n' +
    '      max-height: 100%;\n' +
    '    }\n' +
    '\n' +
    '    .layout-row  .flex-66 {\n' +
    '      max-width: calc(200% / 3);\n' +
    '      max-height: 100%;\n' +
    '    }\n' +
    '\n' +
    '    .layout-column .flex-33 {\n' +
    '      max-width: 100%;\n' +
    '      max-height: calc(100% / 3);\n' +
    '    }\n' +
    '\n' +
    '    .layout-column  .flex-66 {\n' +
    '      max-width: 100%;\n' +
    '      max-height: calc(200% / 3);\n' +
    '    }\n' +
    '  </hljs>\n' +
    '\n' +
    '</div>\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/layout-options.tmpl.html',
    '<div ng-controller="LayoutCtrl" class="layout-content layout-options" ng-cloak>\n' +
    '\n' +
    '  <docs-demo demo-title="Responsive Layout" class="small-demo colorNested">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="row" layout-sm="column">\n' +
    '        <div flex>\n' +
    '          I\'m above on mobile, and to the left on larger devices.\n' +
    '        </div>\n' +
    '        <div flex>\n' +
    '          I\'m below on mobile, and to the right on larger devices.\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '  <p>\n' +
    '    See the <a href="layout/container">Container Elements</a> page for a basic explanation\n' +
    '    of layout directives.\n' +
    '    <br/>\n' +
    '    To make your layout change depending upon the device screen size, there are\n' +
    '    other <code>layout</code> directives available:\n' +
    '  </p>\n' +
    '\n' +
    '  <table class="md-api-table">\n' +
    '    <thead>\n' +
    '    <tr>\n' +
    '      <th>API</th>\n' +
    '      <th>Activates when device</th>\n' +
    '    </tr>\n' +
    '    </thead>\n' +
    '    <tr>\n' +
    '      <td>layout</td>\n' +
    '      <td>Sets default layout direction unless overridden by another breakpoint.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-xs</td>\n' +
    '      <td>width &lt; <b>600</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-gt-xs</td>\n' +
    '      <td>width &gt;= <b>600</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-sm</td>\n' +
    '      <td><b>600</b>px &lt;= width &lt; <b>960</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-gt-sm</td>\n' +
    '      <td>width &gt;= <b>960</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-md</td>\n' +
    '      <td><b>960</b>px &lt;= width &lt; <b>1280</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-gt-md</td>\n' +
    '      <td>width &gt;= <b>1280</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-lg</td>\n' +
    '      <td><b>1280</b>px &lt;= width &lt; <b>1920</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-gt-lg</td>\n' +
    '      <td>width &gt;= <b>1920</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-xl</td>\n' +
    '      <td>width &gt;= <b>1920</b>px</td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '  <br/>\n' +
    '\n' +
    '  <br/>\n' +
    '  <hr>\n' +
    '  <br/>\n' +
    '\n' +
    '  <h3>Layout Margin, Padding, Wrap and Fill</h3>\n' +
    '  <br/>\n' +
    '\n' +
    '\n' +
    '  <docs-demo demo-title="Layout Margin, Padding, and Fill" class="small-demo colorNested-noPad">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="row" layout-margin>\n' +
    '        <div flex>Parent layout and this element have margins.</div>\n' +
    '      </div>\n' +
    '      <div layout="row" layout-padding>\n' +
    '        <div flex>Parent layout and this element have padding.</div>\n' +
    '      </div>\n' +
    '      <div layout="row" layout-fill style="min-height: 224px;">\n' +
    '        <div flex>Parent layout is set to fill available space.</div>\n' +
    '      </div>\n' +
    '      <div layout="row" layout-padding layout-margin layout-fill style="min-height: 224px;">\n' +
    '        <div flex>I am using all three at once.</div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '  <p>\n' +
    '    <code>layout-margin</code> adds margin around each <code>flex</code> child. It also adds a margin to the layout\n' +
    '    container itself.\n' +
    '    <br/>\n' +
    '    <code>layout-padding</code> adds padding inside each <code>flex</code> child. It also adds padding to the layout\n' +
    '    container itself.\n' +
    '    <br/>\n' +
    '    <code>layout-fill</code> forces the layout element to fill its parent container.\n' +
    '  </p>\n' +
    '\n' +
    '\n' +
    '  <p>Here is a non-trivial group of <code>flex</code> elements using <code>layout-wrap</code></p>\n' +
    '\n' +
    '  <docs-demo demo-title="Wrap" class="small-demo colorNested-noPad">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="row" layout-wrap>\n' +
    '        <div flex="33">[flex=33]</div>\n' +
    '        <div flex="66">[flex=66]</div>\n' +
    '        <div flex="66">[flex=66]</div>\n' +
    '        <div flex="33">[flex=33]</div>\n' +
    '        <div flex="33">[flex=33]</div>\n' +
    '        <div flex="33">[flex=33]</div>\n' +
    '        <div flex="33">[flex=33]</div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '  <p>\n' +
    '    <code>layout-wrap</code> allows <code>flex</code> children to wrap within the container if the elements use more\n' +
    '    than 100%.\n' +
    '    <br/>\n' +
    '  </p>\n' +
    '\n' +
    '  <br/>\n' +
    '\n' +
    '  <br/>\n' +
    '    <hr>\n' +
    '    <br/>\n' +
    '\n' +
    '    <h3>Show &amp; Hide </h3>\n' +
    '\n' +
    '  <p>Use the <code>show</code> <code>hide</code> APIs to responsively show or hide elements. While these work similar\n' +
    '  to <code>ng-show</code> and <code>ng-hide</code>, these Angular Material Layout directives are mediaQuery-aware.\n' +
    '  </p>\n' +
    '\n' +
    '  <docs-demo demo-title="Hide and Show Directives" class="small-demo colorNested">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="row">\n' +
    '        <div hide show-gt-sm flex>\n' +
    '          Only show on gt-sm devices.\n' +
    '        </div>\n' +
    '        <div hide-gt-sm flex>\n' +
    '          Shown on small and medium.<br/>\n' +
    '          Hidden on gt-sm devices.\n' +
    '        </div>\n' +
    '        <div show hide-gt-md flex>\n' +
    '          Shown on small and medium size devices.<br/>\n' +
    '          Hidden on gt-md devices.\n' +
    '        </div>\n' +
    '        <div hide show-md flex>\n' +
    '          Shown on medium size devices only.\n' +
    '        </div>\n' +
    '        <div hide show-gt-lg flex>\n' +
    '          Shown on devices larger than 1200px wide only.\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '  <br/>\n' +
    '  <table class="md-api-table">\n' +
    '    <thead>\n' +
    '      <tr>\n' +
    '        <th>hide (display: none)</th>\n' +
    '        <th>show (negates hide)</th>\n' +
    '        <th>Activates when:</th>\n' +
    '      </tr>\n' +
    '    </thead>\n' +
    '    <tr>\n' +
    '      <td>hide-xs</td>\n' +
    '      <td>show-xs</td>\n' +
    '      <td>width &lt; <b>600</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>hide-gt-xs</td>\n' +
    '      <td>show-gt-xs</td>\n' +
    '      <td>width &gt;= <b>600</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>hide-sm</td>\n' +
    '      <td>show-sm</td>\n' +
    '      <td><b>600</b>px &lt;= width &lt; <b>960</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>hide-gt-sm</td>\n' +
    '      <td>show-gt-sm</td>\n' +
    '      <td>width &gt;= <b>960</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>hide-md</td>\n' +
    '      <td>show-md</td>\n' +
    '      <td><b>960</b>px &lt;= width &lt; <b>1280</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>hide-gt-md</td>\n' +
    '      <td>show-gt-md</td>\n' +
    '      <td>width &gt;= <b>1280</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>hide-lg</td>\n' +
    '      <td>show-lg</td>\n' +
    '      <td><b>1280</b>px &lt;= width &lt; <b>1920</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>hide-gt-lg</td>\n' +
    '      <td>show-gt-lg</td>\n' +
    '      <td>width &gt;= <b>1920</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>hide-xl</td>\n' +
    '      <td>show-xl</td>\n' +
    '      <td>width &gt;= <b>1920</b>px</td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '\n' +
    '\n' +
    '</div>\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/layout-tips.tmpl.html',
    '<style>\n' +
    '  ul.spaced li {\n' +
    '    margin-bottom: 15px;\n' +
    '  }\n' +
    '</style>\n' +
    '<div ng-controller="LayoutTipsCtrl as tips" class="layout-content">\n' +
    '  <h3>Overview</h3>\n' +
    '\n' +
    '  <p>\n' +
    '    The Angular Material Layout system uses the current\n' +
    '    <a href="http://www.w3.org/TR/css3-flexbox/">Flexbox</a> feature set. More importantly, it also\n' +
    '    adds syntactic sugar to allow developers to easily and quickly add Responsive features to HTML\n' +
    '    containers and elements.\n' +
    '  </p>\n' +
    '\n' +
    '  <p>\n' +
    '    As you use the Layout features, you may encounter scenarios where the layouts do not render as\n' +
    '    expected; especially with IE 10 and 11 browsers. There may also be cases where you need to add\n' +
    '    custom HTML, CSS and Javascript to achieve your desired results.\n' +
    '  </p>\n' +
    '\n' +
    '\n' +
    '  <br/>\n' +
    '  <hr/>\n' +
    '\n' +
    '  <h3>Resources</h3>\n' +
    '\n' +
    '  <p>\n' +
    '    If you are experiencing an issue in a particular browser, we highly recommend using the\n' +
    '    following resources for known issues and workarounds.\n' +
    '  </p>\n' +
    '\n' +
    '  <ul>\n' +
    '    <li><a href="https://github.com/philipwalton/flexbugs#flexbugs" target="_blank">FlexBugs</a></li>\n' +
    '    <li><a href="https://philipwalton.github.io/solved-by-flexbox/" target="_blank">Solved by FlexBugs</a></li>\n' +
    '    <li><a href="http://philipwalton.com/articles/normalizing-cross-browser-flexbox-bugs/" target="_blank">Normalizing Cross-browser Flexbox Bugs</a></li>\n' +
    '    <li style="margin-bottom: 20px;"><a href="http://caniuse.com/#search=flex" target="_blank">Can I use flexbox...? ( see the <code>Known Issues</code> tab)</a></li>\n' +
    '    <li><a href="https://groups.google.com/forum/#!forum/ngmaterial">Angular Material Forum</a></li>\n' +
    '    <li style="margin-top: 20px;"><a href="https://css-tricks.com/snippets/css/a-guide-to-flexbox/" target="_blank">A Complete Guide to Flexbox</a></li>\n' +
    '    <li style="margin-bottom: 20px;"><a href="https://scotch.io/tutorials/a-visual-guide-to-css3-flexbox-properties" target="_blank">A Visual Guide to CSS3 Flexbox Properties</a></li>\n' +
    '  </ul>\n' +
    '\n' +
    '\n' +
    '  <br/>\n' +
    '  <hr/>\n' +
    '\n' +
    '  <h3>General Tips</h3>\n' +
    '\n' +
    '  <p>\n' +
    '    Below, you will find solutions to some of the more common scenarios and problems that may arise\n' +
    '    when using Material\'s Layout system. The following sections offer general guidelines and tips when using the <code>flex</code> and\n' +
    '        <code>layout</code> directives within your own applications.\n' +
    '  </p>\n' +
    '\n' +
    '  <ul class="spaced">\n' +
    '    <li>\n' +
    '      When building your application\'s Layout, it is usually best to start with a mobile version\n' +
    '      that looks and works correctly, and then apply styling for larger devices using the\n' +
    '      <code>flex-gt-*</code> or <code>hide-gt-*</code> attributes. This approach typically leads\n' +
    '      to less frustration than starting big and attempting to fix issues on smaller devices.\n' +
    '    </li>\n' +
    '\n' +
    '    <li>\n' +
    '      Some elements like <code>&lt;fieldset&gt;</code> and <code>&lt;button&gt;</code> do not always\n' +
    '      work correctly with flex. Additionally, some of the Angular Material components provide their\n' +
    '      own styles. If you are having difficulty with a specific element/component, but not\n' +
    '      others, try applying the flex attributes to a parent or child <code>&lt;div&gt;</code> of the\n' +
    '      element instead.\n' +
    '    </li>\n' +
    '\n' +
    '    <li>\n' +
    '      Some Flexbox properties such as <code>flex-direction</code> <u>cannot</u> be animated.\n' +
    '    </li>\n' +
    '\n' +
    '    <li>\n' +
    '      Flexbox can behave differently on different browsers. You should test as many as possible on\n' +
    '      a regular basis so that you can catch and fix layout issues more quickly.\n' +
    '    </li>\n' +
    '  </ul>\n' +
    '\n' +
    '  <br/>\n' +
    '  <hr/>\n' +
    '\n' +
    '  <h3>Layout Column</h3>\n' +
    '\n' +
    '  <p>\n' +
    '    In some scenarios <code>layout="column"</code> and breakpoints (xs, gt-xs, xs, gt-sm, etc.) may not work\n' +
    '    as expected due to CSS specificity rules.\n' +
    '  </p>\n' +
    '\n' +
    '  <div class="md-whiteframe-3dp">\n' +
    '\n' +
    '    <iframe height=\'700\' scrolling=\'no\'\n' +
    '            src=\'//codepen.io/team/AngularMaterial/embed/obgapg/?height=700&theme-id=21180&default-tab=result\'\n' +
    '            frameborder=\'no\' allowtransparency=\'true\' allowfullscreen=\'true\' style=\'width: 100%;\'>See the Pen <a\n' +
    '        href=\'http://codepen.io/team/AngularMaterial/pen/obgapg/\'>Card Layouts (corrected)</a> by Angular Material (<a\n' +
    '        href=\'http://codepen.io/AngularMaterial\'>@AngularMaterial</a>) on <a href=\'http://codepen.io\'>CodePen</a>.\n' +
    '    </iframe>\n' +
    '\n' +
    '  </div>\n' +
    '\n' +
    '    <p>\n' +
    '      This is easily fixed simply by inverting the layout logic so that the default is <code>layout=\'row\'</code>.\n' +
    '      To see how the layout changes, shrink the browser window its width is <600px;\n' +
    '    </p>\n' +
    '\n' +
    '\n' +
    '  <br/>\n' +
    '  <hr/>\n' +
    '\n' +
    '  <h3 id="layout-column-0px-ie11">IE11 - Layout Column, 0px Height</h3>\n' +
    '\n' +
    '  <p>\n' +
    '    In Internet Explorer 11, when you have a column layout with unspecified height and flex items\n' +
    '    inside, the browser can get confused and incorrectly calculate the height of each item (and thus\n' +
    '    the container) as <code>0px</code>, making the items overlap and not take up the proper amount\n' +
    '    of space.\n' +
    '  </p>\n' +
    '\n' +
    '  <p class="layout_note">\n' +
    '    <b>Note:</b> The flex items below actually do have some height. This is because our doc-specific\n' +
    '    CSS provides a small bit of padding (<code>8px</code>). We felt that the extra padding made for\n' +
    '    a better demo of the actual issue.\n' +
    '  </p>\n' +
    '\n' +
    '  <docs-demo demo-title="IE11 - Layout Column, 0px Height" class="colorNested">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div flex layout="column">\n' +
    '        <div flex>\n' +
    '          11111<br />11111<br />11111\n' +
    '        </div>\n' +
    '\n' +
    '        <div flex>\n' +
    '          22222<br />22222<br />22222\n' +
    '        </div>\n' +
    '\n' +
    '        <div flex>\n' +
    '          33333<br />33333<br />33333\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '  <p>\n' +
    '    Unfortunately, there is no IE11 specific fix available, and the suggested workaround is to set\n' +
    '    the <code>flex-basis</code> property to <code>auto</code> instead of <code>0px</code> (which is\n' +
    '    the default setting).\n' +
    '  </p>\n' +
    '\n' +
    '  <p>\n' +
    '    You can easily achieve this using the <code>flex="auto"</code> attribute that the Layout system\n' +
    '    provides.\n' +
    '  </p>\n' +
    '\n' +
    '  <docs-demo demo-title="IE11 - Layout Column, 0px Height (Fix 1)" class="colorNested">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div flex layout="column">\n' +
    '        <div flex="auto">\n' +
    '          11111<br />11111<br />11111\n' +
    '        </div>\n' +
    '\n' +
    '        <div flex="auto">\n' +
    '          22222<br />22222<br />22222\n' +
    '        </div>\n' +
    '\n' +
    '        <div flex="auto">\n' +
    '          33333<br />33333<br />33333\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '\n' +
    '  <p>\n' +
    '    Alternatively, you can manually set the height of the layout container (<code>400px</code>\n' +
    '    in the demo below).\n' +
    '  </p>\n' +
    '\n' +
    '  <docs-demo demo-title="IE11 - Layout Column, 0px Height (Fix 2)" class="colorNested">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div flex layout="column" style="height: 400px;">\n' +
    '        <div flex>\n' +
    '          11111<br />11111<br />11111\n' +
    '        </div>\n' +
    '\n' +
    '        <div flex>\n' +
    '          22222<br />22222<br />22222\n' +
    '        </div>\n' +
    '\n' +
    '        <div flex>\n' +
    '          33333<br />33333<br />33333\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '  <br/>\n' +
    '  <hr/>\n' +
    '\n' +
    '  <h3>Flex Element Heights</h3>\n' +
    '\n' +
    '  <p>\n' +
    '    Firefox currently has an issue calculating the proper height of flex containers whose children\n' +
    '    are flex, but have more content than can properly fit within the container.\n' +
    '  </p>\n' +
    '\n' +
    '  <p>\n' +
    '    This is particularly problematic if the <code>flex</code> children are <code>md-content</code> components as\n' +
    '    it will prevent the content from scrolling correctly, instead scrolling the entire body.\n' +
    '  </p>\n' +
    '\n' +
    '  <div class="md-whiteframe-3dp">\n' +
    '    <iframe height=\'376\' scrolling=\'no\'\n' +
    '            src=\'//codepen.io/team/AngularMaterial/embed/NxKBwW/?height=376&theme-id=0&default-tab=result\'\n' +
    '            frameborder=\'no\' allowtransparency=\'true\' allowfullscreen=\'true\' style=\'width: 100%;\'>\n' +
    '      See the Pen <a href=\'http://codepen.io/team/AngularMaterial/pen/NxKBwW/\'>Angular Material Basic App</a>\n' +
    '      by Angular Material (<a href=\'http://codepen.io/AngularMaterial\'>@AngularMaterial</a>)\n' +
    '      on <a href=\'http://codepen.io\'>CodePen</a>.\n' +
    '    </iframe>\n' +
    '  </div>\n' +
    '\n' +
    '  <p>\n' +
    '    Notice in the above Codepen how we must set <code>overflow: auto</code> on the div with the\n' +
    '    <code>change-my-css</code> class in order for Firefox to properly calculate the height and\n' +
    '    shrink to the available space.\n' +
    '  </p>\n' +
    '\n' +
    '</div>\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/license.tmpl.html',
    '<div ng-controller="GuideCtrl" class="doc-content">\n' +
    '  <md-content>\n' +
    '    <p>The MIT License</p>\n' +
    '\n' +
    '    <p>\n' +
    '      Copyright (c) 2014-2016 Google, Inc.\n' +
    '      <a href="http://angularjs.org">http://angularjs.org</a>\n' +
    '    </p>\n' +
    '\n' +
    '    <p>\n' +
    '      Permission is hereby granted, free of charge, to any person obtaining a copy\n' +
    '      of this software and associated documentation files (the "Software"), to deal\n' +
    '      in the Software without restriction, including without limitation the rights\n' +
    '      to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n' +
    '      copies of the Software, and to permit persons to whom the Software is\n' +
    '      furnished to do so, subject to the following conditions:\n' +
    '    </p>\n' +
    '\n' +
    '    <p>\n' +
    '      The above copyright notice and this permission notice shall be included in\n' +
    '      all copies or substantial portions of the Software.\n' +
    '    </p>\n' +
    '\n' +
    '    <p>\n' +
    '      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n' +
    '      IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n' +
    '      FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n' +
    '      AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n' +
    '      LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n' +
    '      OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n' +
    '      THE SOFTWARE.\n' +
    '    </p>\n' +
    '  </md-content>\n' +
    '</div>');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/menu-link.tmpl.html',
    '<md-button\n' +
    '    ng-class="{\'active\' : isSelected()}"\n' +
    '    ng-href="{{section.url}}"\n' +
    '    ng-click="focusSection()">\n' +
    '  {{section | humanizeDoc}}\n' +
    '  <span class="md-visually-hidden"\n' +
    '    ng-if="isSelected()">\n' +
    '    current page\n' +
    '  </span>\n' +
    '</md-button>\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/menu-toggle.tmpl.html',
    '<md-button class="md-button-toggle"\n' +
    '  ng-click="toggle()"\n' +
    '  aria-controls="docs-menu-{{section.name | nospace}}"\n' +
    '  aria-expanded="{{isOpen()}}">\n' +
    '  <div flex layout="row">\n' +
    '    {{section.name}}\n' +
    '    <span flex></span>\n' +
    '    <span aria-hidden="true" class="md-toggle-icon"\n' +
    '    ng-class="{\'toggled\' : isOpen()}">\n' +
    '      <md-icon md-svg-icon="md-toggle-arrow"></md-icon>\n' +
    '    </span>\n' +
    '  </div>\n' +
    '  <span class="md-visually-hidden">\n' +
    '    Toggle {{isOpen()? \'expanded\' : \'collapsed\'}}\n' +
    '  </span>\n' +
    '</md-button>\n' +
    '\n' +
    '<ul id="docs-menu-{{section.name | nospace}}"\n' +
    '  class="menu-toggle-list"\n' +
    '  aria-hidden="{{!renderContent}}"\n' +
    '  ng-style="{ visibility: renderContent ? \'visible\' : \'hidden\' }">\n' +
    '\n' +
    '  <li ng-repeat="page in section.pages">\n' +
    '    <menu-link section="page"></menu-link>\n' +
    '  </li>\n' +
    '</ul>\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/view-source.tmpl.html',
    '<md-dialog class="view-source-dialog">\n' +
    '\n' +
    '  <md-tabs>\n' +
    '    <md-tab ng-repeat="file in files"\n' +
    '                  active="file === data.selectedFile"\n' +
    '                  ng-click="data.selectedFile = file" >\n' +
    '        <span class="window_label">{{file.viewType}}</span>\n' +
    '    </md-tab>\n' +
    '  </md-tabs>\n' +
    '\n' +
    '  <md-dialog-content md-scroll-y flex>\n' +
    '    <div ng-repeat="file in files">\n' +
    '      <hljs code="file.content"\n' +
    '        lang="{{file.fileType}}"\n' +
    '        ng-show="file === data.selectedFile" >\n' +
    '      </hljs>\n' +
    '    </div>\n' +
    '  </md-dialog-content>\n' +
    '\n' +
    '  <md-dialog-actions layout="horizontal">\n' +
    '    <md-button class="md-primary" ng-click="$hideDialog()">\n' +
    '      Done\n' +
    '    </md-button>\n' +
    '  </md-dialog-actions>\n' +
    '</md-dialog>\n' +
    '');
}]);

angular.module('docsApp')
.directive('hljs', ['$timeout', '$q', '$interpolate', function($timeout, $q, $interpolate) {
  return {
    restrict: 'E',
    compile: function(element, attr) {
      var code;
      //No attribute? code is the content
      if (!attr.code) {
        code = element.html();
        element.empty();
      }

      return function(scope, element, attr) {

        if (attr.code) {
          // Attribute? code is the evaluation
          code = scope.$eval(attr.code);
        }
        var shouldInterpolate = scope.$eval(attr.shouldInterpolate);

        $q.when(code).then(function(code) {
          if (code) {
            if (shouldInterpolate) {
              code = $interpolate(code)(scope);
            }
            var contentParent = angular.element(
              '<pre><code class="highlight" ng-non-bindable></code></pre>'
            );
            element.append(contentParent);
            // Defer highlighting 1-frame to prevent GA interference...
            $timeout(function() {
              render(code, contentParent);
            }, 34, false);
          }
        });

        function render(contents, parent) {
          var codeElement = parent.find('code');

          // Strip excessive newlines and the leading/trailing newline (otherwise the whitespace
          // calculations below are not correct).
          var strippedContents = contents.replace(/\n{2,}/g, '\n\n').replace(/^\n/, '').replace(/\n$/, '');
          var lines = strippedContents.split('\n');

          // Make it so each line starts at 0 whitespace
          var firstLineWhitespace = lines[0].match(/^\s*/)[0];
          var startingWhitespaceRegex = new RegExp('^' + firstLineWhitespace);
          lines = lines.map(function(line) {
            return line
              .replace(startingWhitespaceRegex, '')
              .replace(/\s+$/, '');
          });

          var highlightedCode = hljs.highlight(attr.language || attr.lang, lines.join('\n'), true);
          highlightedCode.value = highlightedCode.value
            .replace(/=<span class="hljs-value">""<\/span>/gi, '')
            .replace('<head>', '')
            .replace('<head/>', '');
          codeElement.append(highlightedCode.value).addClass('highlight');
        }
      };
    }
  };
}]);

var hljs=new function(){function j(v){return v.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;")}function t(v){return v.nodeName.toLowerCase()}function h(w,x){var v=w&&w.exec(x);return v&&v.index==0}function r(w){var v=(w.className+" "+(w.parentNode?w.parentNode.className:"")).split(/\s+/);v=v.map(function(x){return x.replace(/^lang(uage)?-/,"")});return v.filter(function(x){return i(x)||x=="no-highlight"})[0]}function o(x,y){var v={};for(var w in x){v[w]=x[w]}if(y){for(var w in y){v[w]=y[w]}}return v}function u(x){var v=[];(function w(y,z){for(var A=y.firstChild;A;A=A.nextSibling){if(A.nodeType==3){z+=A.nodeValue.length}else{if(t(A)=="br"){z+=1}else{if(A.nodeType==1){v.push({event:"start",offset:z,node:A});z=w(A,z);v.push({event:"stop",offset:z,node:A})}}}}return z})(x,0);return v}function q(w,y,C){var x=0;var F="";var z=[];function B(){if(!w.length||!y.length){return w.length?w:y}if(w[0].offset!=y[0].offset){return(w[0].offset<y[0].offset)?w:y}return y[0].event=="start"?w:y}function A(H){function G(I){return" "+I.nodeName+'="'+j(I.value)+'"'}F+="<"+t(H)+Array.prototype.map.call(H.attributes,G).join("")+">"}function E(G){F+="</"+t(G)+">"}function v(G){(G.event=="start"?A:E)(G.node)}while(w.length||y.length){var D=B();F+=j(C.substr(x,D[0].offset-x));x=D[0].offset;if(D==w){z.reverse().forEach(E);do{v(D.splice(0,1)[0]);D=B()}while(D==w&&D.length&&D[0].offset==x);z.reverse().forEach(A)}else{if(D[0].event=="start"){z.push(D[0].node)}else{z.pop()}v(D.splice(0,1)[0])}}return F+j(C.substr(x))}function m(y){function v(z){return(z&&z.source)||z}function w(A,z){return RegExp(v(A),"m"+(y.cI?"i":"")+(z?"g":""))}function x(D,C){if(D.compiled){return}D.compiled=true;D.k=D.k||D.bK;if(D.k){var z={};var E=function(G,F){if(y.cI){F=F.toLowerCase()}F.split(" ").forEach(function(H){var I=H.split("|");z[I[0]]=[G,I[1]?Number(I[1]):1]})};if(typeof D.k=="string"){E("keyword",D.k)}else{Object.keys(D.k).forEach(function(F){E(F,D.k[F])})}D.k=z}D.lR=w(D.l||/\b[A-Za-z0-9_]+\b/,true);if(C){if(D.bK){D.b="\\b("+D.bK.split(" ").join("|")+")\\b"}if(!D.b){D.b=/\B|\b/}D.bR=w(D.b);if(!D.e&&!D.eW){D.e=/\B|\b/}if(D.e){D.eR=w(D.e)}D.tE=v(D.e)||"";if(D.eW&&C.tE){D.tE+=(D.e?"|":"")+C.tE}}if(D.i){D.iR=w(D.i)}if(D.r===undefined){D.r=1}if(!D.c){D.c=[]}var B=[];D.c.forEach(function(F){if(F.v){F.v.forEach(function(G){B.push(o(F,G))})}else{B.push(F=="self"?D:F)}});D.c=B;D.c.forEach(function(F){x(F,D)});if(D.starts){x(D.starts,C)}var A=D.c.map(function(F){return F.bK?"\\.?("+F.b+")\\.?":F.b}).concat([D.tE,D.i]).map(v).filter(Boolean);D.t=A.length?w(A.join("|"),true):{exec:function(F){return null}};D.continuation={}}x(y)}function c(S,L,J,R){function v(U,V){for(var T=0;T<V.c.length;T++){if(h(V.c[T].bR,U)){return V.c[T]}}}function z(U,T){if(h(U.eR,T)){return U}if(U.eW){return z(U.parent,T)}}function A(T,U){return !J&&h(U.iR,T)}function E(V,T){var U=M.cI?T[0].toLowerCase():T[0];return V.k.hasOwnProperty(U)&&V.k[U]}function w(Z,X,W,V){var T=V?"":b.classPrefix,U='<span class="'+T,Y=W?"":"</span>";U+=Z+'">';return U+X+Y}function N(){if(!I.k){return j(C)}var T="";var W=0;I.lR.lastIndex=0;var U=I.lR.exec(C);while(U){T+=j(C.substr(W,U.index-W));var V=E(I,U);if(V){H+=V[1];T+=w(V[0],j(U[0]))}else{T+=j(U[0])}W=I.lR.lastIndex;U=I.lR.exec(C)}return T+j(C.substr(W))}function F(){if(I.sL&&!f[I.sL]){return j(C)}var T=I.sL?c(I.sL,C,true,I.continuation.top):e(C);if(I.r>0){H+=T.r}if(I.subLanguageMode=="continuous"){I.continuation.top=T.top}return w(T.language,T.value,false,true)}function Q(){return I.sL!==undefined?F():N()}function P(V,U){var T=V.cN?w(V.cN,"",true):"";if(V.rB){D+=T;C=""}else{if(V.eB){D+=j(U)+T;C=""}else{D+=T;C=U}}I=Object.create(V,{parent:{value:I}})}function G(T,X){C+=T;if(X===undefined){D+=Q();return 0}var V=v(X,I);if(V){D+=Q();P(V,X);return V.rB?0:X.length}var W=z(I,X);if(W){var U=I;if(!(U.rE||U.eE)){C+=X}D+=Q();do{if(I.cN){D+="</span>"}H+=I.r;I=I.parent}while(I!=W.parent);if(U.eE){D+=j(X)}C="";if(W.starts){P(W.starts,"")}return U.rE?0:X.length}if(A(X,I)){throw new Error('Illegal lexeme "'+X+'" for mode "'+(I.cN||"<unnamed>")+'"')}C+=X;return X.length||1}var M=i(S);if(!M){throw new Error('Unknown language: "'+S+'"')}m(M);var I=R||M;var D="";for(var K=I;K!=M;K=K.parent){if(K.cN){D+=w(K.cN,D,true)}}var C="";var H=0;try{var B,y,x=0;while(true){I.t.lastIndex=x;B=I.t.exec(L);if(!B){break}y=G(L.substr(x,B.index-x),B[0]);x=B.index+y}G(L.substr(x));for(var K=I;K.parent;K=K.parent){if(K.cN){D+="</span>"}}return{r:H,value:D,language:S,top:I}}catch(O){if(O.message.indexOf("Illegal")!=-1){return{r:0,value:j(L)}}else{throw O}}}function e(y,x){x=x||b.languages||Object.keys(f);var v={r:0,value:j(y)};var w=v;x.forEach(function(z){if(!i(z)){return}var A=c(z,y,false);A.language=z;if(A.r>w.r){w=A}if(A.r>v.r){w=v;v=A}});if(w.language){v.second_best=w}return v}function g(v){if(b.tabReplace){v=v.replace(/^((<[^>]+>|\t)+)/gm,function(w,z,y,x){return z.replace(/\t/g,b.tabReplace)})}if(b.useBR){v=v.replace(/\n/g,"<br>")}return v}function p(z){var y=b.useBR?z.innerHTML.replace(/\n/g,"").replace(/<br>|<br [^>]*>/g,"\n").replace(/<[^>]*>/g,""):z.textContent;var A=r(z);if(A=="no-highlight"){return}var v=A?c(A,y,true):e(y);var w=u(z);if(w.length){var x=document.createElementNS("http://www.w3.org/1999/xhtml","pre");x.innerHTML=v.value;v.value=q(w,u(x),y)}v.value=g(v.value);z.innerHTML=v.value;z.className+=" hljs "+(!A&&v.language||"");z.result={language:v.language,re:v.r};if(v.second_best){z.second_best={language:v.second_best.language,re:v.second_best.r}}}var b={classPrefix:"hljs-",tabReplace:null,useBR:false,languages:undefined};function s(v){b=o(b,v)}function l(){if(l.called){return}l.called=true;var v=document.querySelectorAll("pre code");Array.prototype.forEach.call(v,p)}function a(){addEventListener("DOMContentLoaded",l,false);addEventListener("load",l,false)}var f={};var n={};function d(v,x){var w=f[v]=x(this);if(w.aliases){w.aliases.forEach(function(y){n[y]=v})}}function k(){return Object.keys(f)}function i(v){return f[v]||f[n[v]]}this.highlight=c;this.highlightAuto=e;this.fixMarkup=g;this.highlightBlock=p;this.configure=s;this.initHighlighting=l;this.initHighlightingOnLoad=a;this.registerLanguage=d;this.listLanguages=k;this.getLanguage=i;this.inherit=o;this.IR="[a-zA-Z][a-zA-Z0-9_]*";this.UIR="[a-zA-Z_][a-zA-Z0-9_]*";this.NR="\\b\\d+(\\.\\d+)?";this.CNR="(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)";this.BNR="\\b(0b[01]+)";this.RSR="!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~";this.BE={b:"\\\\[\\s\\S]",r:0};this.ASM={cN:"string",b:"'",e:"'",i:"\\n",c:[this.BE]};this.QSM={cN:"string",b:'"',e:'"',i:"\\n",c:[this.BE]};this.PWM={b:/\b(a|an|the|are|I|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such)\b/};this.CLCM={cN:"comment",b:"//",e:"$",c:[this.PWM]};this.CBCM={cN:"comment",b:"/\\*",e:"\\*/",c:[this.PWM]};this.HCM={cN:"comment",b:"#",e:"$",c:[this.PWM]};this.NM={cN:"number",b:this.NR,r:0};this.CNM={cN:"number",b:this.CNR,r:0};this.BNM={cN:"number",b:this.BNR,r:0};this.CSSNM={cN:"number",b:this.NR+"(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",r:0};this.RM={cN:"regexp",b:/\//,e:/\/[gim]*/,i:/\n/,c:[this.BE,{b:/\[/,e:/\]/,r:0,c:[this.BE]}]};this.TM={cN:"title",b:this.IR,r:0};this.UTM={cN:"title",b:this.UIR,r:0}}();hljs.registerLanguage("javascript",function(a){return{aliases:["js"],k:{keyword:"in if for while finally var new function do return void else break catch instanceof with throw case default try this switch continue typeof delete let yield const class",literal:"true false null undefined NaN Infinity",built_in:"eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Error EvalError InternalError RangeError ReferenceError StopIteration SyntaxError TypeError URIError Number Math Date String RegExp Array Float32Array Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require module console window document"},c:[{cN:"pi",b:/^\s*('|")use strict('|")/,r:10},a.ASM,a.QSM,a.CLCM,a.CBCM,a.CNM,{b:"("+a.RSR+"|\\b(case|return|throw)\\b)\\s*",k:"return throw case",c:[a.CLCM,a.CBCM,a.RM,{b:/</,e:/>;/,r:0,sL:"xml"}],r:0},{cN:"function",bK:"function",e:/\{/,eE:true,c:[a.inherit(a.TM,{b:/[A-Za-z$_][0-9A-Za-z$_]*/}),{cN:"params",b:/\(/,e:/\)/,c:[a.CLCM,a.CBCM],i:/["'\(]/}],i:/\[|%/},{b:/\$[(.]/},{b:"\\."+a.IR,r:0}]}});hljs.registerLanguage("css",function(a){var b="[a-zA-Z-][a-zA-Z0-9_-]*";var c={cN:"function",b:b+"\\(",rB:true,eE:true,e:"\\("};return{cI:true,i:"[=/|']",c:[a.CBCM,{cN:"id",b:"\\#[A-Za-z0-9_-]+"},{cN:"class",b:"\\.[A-Za-z0-9_-]+",r:0},{cN:"attr_selector",b:"\\[",e:"\\]",i:"$"},{cN:"pseudo",b:":(:)?[a-zA-Z0-9\\_\\-\\+\\(\\)\\\"\\']+"},{cN:"at_rule",b:"@(font-face|page)",l:"[a-z-]+",k:"font-face page"},{cN:"at_rule",b:"@",e:"[{;]",c:[{cN:"keyword",b:/\S+/},{b:/\s/,eW:true,eE:true,r:0,c:[c,a.ASM,a.QSM,a.CSSNM]}]},{cN:"tag",b:b,r:0},{cN:"rules",b:"{",e:"}",i:"[^\\s]",r:0,c:[a.CBCM,{cN:"rule",b:"[^\\s]",rB:true,e:";",eW:true,c:[{cN:"attribute",b:"[A-Z\\_\\.\\-]+",e:":",eE:true,i:"[^\\s]",starts:{cN:"value",eW:true,eE:true,c:[c,a.CSSNM,a.QSM,a.ASM,a.CBCM,{cN:"hexcolor",b:"#[0-9A-Fa-f]+"},{cN:"important",b:"!important"}]}}]}]}]}});hljs.registerLanguage("xml",function(a){var c="[A-Za-z0-9\\._:-]+";var d={b:/<\?(php)?(?!\w)/,e:/\?>/,sL:"php",subLanguageMode:"continuous"};var b={eW:true,i:/</,r:0,c:[d,{cN:"attribute",b:c,r:0},{b:"=",r:0,c:[{cN:"value",v:[{b:/"/,e:/"/},{b:/'/,e:/'/},{b:/[^\s\/>]+/}]}]}]};return{aliases:["html","xhtml","rss","atom","xsl","plist"],cI:true,c:[{cN:"doctype",b:"<!DOCTYPE",e:">",r:10,c:[{b:"\\[",e:"\\]"}]},{cN:"comment",b:"<!--",e:"-->",r:10},{cN:"cdata",b:"<\\!\\[CDATA\\[",e:"\\]\\]>",r:10},{cN:"tag",b:"<style(?=\\s|>|$)",e:">",k:{title:"style"},c:[b],starts:{e:"</style>",rE:true,sL:"css"}},{cN:"tag",b:"<script(?=\\s|>|$)",e:">",k:{title:"script"},c:[b],starts:{e:"<\/script>",rE:true,sL:"javascript"}},{b:"<%",e:"%>",sL:"vbscript"},d,{cN:"pi",b:/<\?\w+/,e:/\?>/,r:10},{cN:"tag",b:"</?",e:"/?>",c:[{cN:"title",b:"[^ /><]+",r:0},b]}]}});

/**
 * ngPanel by @matsko
 * https://github.com/matsko/ng-panel
 */
angular.module('docsApp')
  .directive('ngPanel', ['$animate', function($animate) {
    return {
      restrict: 'EA',
      transclude: 'element',
      terminal: true,
      compile: function(elm, attrs) {
        var attrExp = attrs.ngPanel || attrs['for'];
        var regex = /^(\S+)(?:\s+track by (.+?))?$/;
        var match = regex.exec(attrExp);

        var watchCollection = true;
        var objExp = match[1];
        var trackExp = match[2];
        if (trackExp) {
          watchCollection = false;
        } else {
          trackExp = match[1];
        }

        return function(scope, $element, attrs, ctrl, $transclude) {
          var previousElement, previousScope;
          scope[watchCollection ? '$watchCollection' : '$watch'](trackExp, function(value) {
            if (previousElement) {
              $animate.leave(previousElement);
            }
            if (previousScope) {
              previousScope.$destroy();
              previousScope = null;
            }
            var record = watchCollection ? value : scope.$eval(objExp);
            previousScope = scope.$new();
            $transclude(previousScope, function(element) {
              previousElement = element;
              $animate.enter(element, null, $element);
            });
          });
        };
      }
    };
  }]);


(function() {
  angular.module('docsApp')
    .factory('$demoAngularScripts', ['BUILDCONFIG', DemoAngularScripts]);

  function DemoAngularScripts(BUILDCONFIG) {
    var scripts = [
      'angular.js',
      'angular-animate.min.js',
      'angular-route.min.js',
      'angular-aria.min.js',
      'angular-messages.min.js'
    ];

    return {
      all: allAngularScripts
    };

    function allAngularScripts() {
      return scripts.map(fullPathToScript);
    };

    function fullPathToScript(script) {
      return "https://ajax.googleapis.com/ajax/libs/angularjs/" + BUILDCONFIG.ngVersion + "/" + script;
    };
  };
})();

angular.module('docsApp').constant('SERVICES', [
  {
    "name": "$mdMedia",
    "type": "service",
    "outputPath": "partials/api/material.core/service/$mdMedia.html",
    "url": "api/service/$mdMedia",
    "label": "$mdMedia",
    "module": "material.core",
    "githubUrl": "https://github.com/angular/material/blob/master/src/core/util/media.js",
    "hasDemo": false
  }
]);
