(function($) {

    /**
     * Generate an indented list of links from a nav. Meant for use with panel().
     * @return {jQuery} jQuery object.
     */
    $.fn.navList = function() {
        var $this = $(this);
        var $a = $this.find('a'),
            b = [];

        $a.each(function() {
            var $this = $(this),
                indent = Math.max(0, $this.parents('li').length - 1),
                href = $this.attr('href') || '#',
                target = $this.attr('target') || '';

            // 避免 XSS 攻擊：僅允許 http、https 和 #
            if (!/^https?:\/\//.test(href) && href !== '#') {
                href = '#';
            }

            b.push(
                '<a ' +
                'class="link depth-' + indent + '"' +
                (target ? ' target="' + target.replace(/"/g, '') + '"' : '') +
                (href ? ' href="' + href.replace(/"/g, '') + '"' : '') +
                '>' +
                '<span class="indent-' + indent + '"></span>' +
                $('<div/>').text($this.text()).html() + // 避免 XSS
                '</a>'
            );
        });

        return b.join('');
    };

    /**
     * Panel-ify an element.
     * @param {object} userConfig User config.
     * @return {jQuery} jQuery object.
     */
    $.fn.panel = function(userConfig) {
        if (this.length === 0) return this;

        if (this.length > 1) {
            this.each(function() {
                $(this).panel(userConfig);
            });
            return this;
        }

        var $this = $(this),
            $body = $('body'),
            $window = $(window),
            id = $this.attr('id'),
            config;

        // Config.
        config = $.extend({
            delay: 0,
            hideOnClick: false,
            hideOnEscape: false,
            hideOnSwipe: false,
            resetScroll: false,
            resetForms: false,
            side: null,
            target: $this,
            visibleClass: 'visible'
        }, userConfig);

        // 確保 config.target 是 jQuery 物件
        if (typeof config.target === 'string') {
            try {
                config.target = $(config.target);
                if (config.target.length === 0) throw new Error('Invalid selector');
            } catch (e) {
                config.target = $this;
            }
        } else if (!(config.target instanceof jQuery)) {
            config.target = $this;
        }

        // Panel methods.
        $this._hide = function(event) {
            if (!config.target.hasClass(config.visibleClass)) return;
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            config.target.removeClass(config.visibleClass);

            setTimeout(function() {
                if (config.resetScroll) $this.scrollTop(0);
                if (config.resetForms) {
                    $this.find('form').each(function() {
                        this.reset();
                    });
                }
            }, config.delay);
        };

        // Hide on click
        if (config.hideOnClick) {
            $this.find('a').css('-webkit-tap-highlight-color', 'rgba(0,0,0,0)');
            $this.on('click', 'a', function(event) {
                var $a = $(this),
                    href = $a.attr('href'),
                    target = $a.attr('target');

                if (!href || href === '#' || href === '' || href === '#' + id) return;

                event.preventDefault();
                event.stopPropagation();

                $this._hide();

                setTimeout(function() {
                    if (target === '_blank') window.open(href);
                    else window.location.href = href;
                }, config.delay + 10);
            });
        }

        // Hide on escape
        if (config.hideOnEscape) {
            $window.on('keydown', function(event) {
                if (event.keyCode === 27) $this._hide(event);
            });
        }

        return $this;
    };

})(jQuery);
