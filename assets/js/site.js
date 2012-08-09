(function(context) {
    var Docs = function() {};

    Docs.prototype = {

        queryExamples: function () {
            var search = $('#search');
            var tExamples = _.template($('#examples').html());
            var tags = [], data;

            var fullResult = $.ajax({
                url: 'examples.json',
                dataType: 'json',
                success: function(r) {
                    data = _(r).chain()
                    .compact()
                    .map(function(r) {
                        r.words = (r.title.toLowerCase() + ' ' + (r.tags.toString()).toLowerCase()).match(/(\w+)/g);
                        return r;
                    })
                    .value();
                    _.delay(function () {tagList(tags);}, 10);
                    _.each(data, function(result){
                        $('#results').append(tExamples(result));
                        tags.push(result.tags);
                    });
                }
            });

            var tagList = function (tags) {
                var tTags = _.template($('#tags').html());

                var f = _.flatten(tags);
                var u = _.uniq(f);

                _.each(u, function(tag) {
                    $('#tag-list').append(tTags({'tag': tag}));
                });

                _.delay(function () {
                    $('#tag-list').find('a').on('click', tagFilter);
                }, 1);

                var tagFilter = function(e) {
                    e.preventDefault();
                    $('#results').empty();
                    var tag = $(this).attr('data-tag');

                    if (!$(this).hasClass('active')) {
                        $('#tag-list').find('a').removeClass('active');
                        $(this).addClass('active');

                        var filtered = find(tag.toLowerCase().match(/(\w+)/g));
                        _(filtered).each(function(p) {
                            $('#results').append(tExamples(p));
                        });
                    } else {
                        $(this).removeClass('active');
                        _.each(data, function(result){
                            $('#results').append(tExamples(result));
                        });
                    }
                }
            }

            var find = function(phrase) {
                var matches = _(data).filter(function(p) {
                    return _(phrase).filter(function(a) {
                        return _(p.words).any(function(b) {
                            return a === b || b.indexOf(a) === 0;
                        });
                    }).length === phrase.length;
                });

                return matches;
            };

            $('input', search).keyup(_(function() {
                $('#results').empty();
                var phrase = $('input', search).val();

                if (phrase.length >= 2) {
                    var matches = find(phrase.toLowerCase().match(/(\w+)/g));
                    $('#tag-list').find('a').removeClass('active');
                    _(matches).each(function(p) {
                        $('#results').append(tExamples(p));
                    });
                    if (matches.length) return;
                } else {
                    _.each(data, function(result){
                        $('#results').append(tExamples(result));
                    });
                }

                return false;
            }).debounce(100));
        },

        page: function() {
            $('#toggle-sections').find('a').click(function() {
                if ($('#demo').hasClass('active')) {
                    $(this).text('Back to demo');
                    $('#demo').removeClass('active');
                    $('#snippet').addClass('active');
                } else {
                    $(this).text('View the code');
                    $('#snippet').removeClass('active');
                    $('#demo').addClass('active');
                }
                return false;
            });
        },

        copyCode: function() {
            $('#copy').click(function() {
                if (document.selection) {
                                    var rangeD = document.body.createTextRange();
                                    rangeD.moveToElementText(document.getElementById('code'));
                                    rangeD.select();
                                } else if (window.getSelection) {
                                        var rangeW = document.createRange();
                                        rangeW.selectNode(document.getElementById('code'));
                                        window.getSelection().addRange(rangeW);
                                    }
                        return false;
            });
        },

        colorCode: function() {
            $('pre').addClass('prettyprint');
            prettyPrint();
        },

        search: function() {
            var q = this.value ? this.value.toLowerCase() : null;
            $('.doc-nav').find('[href]').each(function() {
                var $this = $(this),
                    id = $this.attr('href').replace('#', ''),
                    body = $(document.getElementById('content-' + id)).text();

                if (!q || body.toLowerCase().indexOf(q) !== -1 || id.toLowerCase().indexOf(q) !== -1) {
                    if ($this.parent().prop('tagName') == 'H3') {
                        $this.css('color', '');
                    } else {
                        $this.css('display', '');
                    }

                } else {
                    if ($this.parent().prop('tagName') == 'H3') {
                        $this.css('color', '#BDBDBD');
                    } else {
                        $this.css('display', 'none');
                    }
                }
            });

            // Hide headers if no children matched
            $('.doc-nav').find('h3').each(function() {
                var $this = $(this),
                    next = $this.next(),
                    none = true;
                if (next.prop('tagName') === 'UL') {
                    next.children().each(function() {
                        if ($(this).find('a').css('display') !== 'none') return none = false;
                    });
                }
                $this.css('display', none ? 'none' : '');
            });
        },

        bindSearch: function() {
            $('.doc-search input[type=text]').bind('keyup', this.search);
        },

        bindHeadings: function() {
            $('h1[id],h2[id],h3[id],h4[id]').click(function(ev) {
                window.location.hash = $(ev.currentTarget).attr('id');
            });
        }
    };

    window.Docs = Docs;
})(window);

