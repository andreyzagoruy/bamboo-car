(function ($) {

$.fn.doubleSlider = function (opt) {

	// options
	if (!opt) {
		opt = {};
	}
	opt = $.extend({
		'transitionSpeed': 1000,
		'transitionClass': 'transiting',
		'animationInClass': 'fadeIn',
		'animationOutClass': 'fadeOut',
		'paginationHolderClass': 'pagination',
		'nextSlideClass': 'next-slide',
		'prevSlideClass': 'prev-slide',
		'pageSlideClass': 'slide-page',
		'nextSlideHtml': '>',
		'prevSlideHtml': '<',
		'pageSlideHtml': false,
		'slideClass': 'slide',
		'activeClass': 'active',
		'hiddenClass': 'hidden',
		'startSlide': 0,
		'pagination': true
	}, opt);

	var plugin = function () {
		var $slider, slides, currentSlide, DOM, _, public, slidesLength, transitionTime, locked;
		$slider = $(this);
		DOM = {};
		slides = [];

		_ = {
			defineSlides: function () {
				var $el, exist = true;
				slidesLength = 0;
				while (exist) {
					$el = $slider.find('[data-id="' + slidesLength + '"]');
					if ($el.length) {
						$el.addClass(opt.slideClass);
						_.pushSlide($el, slidesLength);
						slidesLength++;
					} else {
						exist = false;
					}
				}
			},
			pushSlide: function ($el, id) {
				var slide = {
					$el: $el,
					id: id
				};
				slides.push(slide);
			},
			bindEvents: function () {
				$slider
					.off()
					.on('click', function (event) {
						var $target = $(event.target), storage;
						if ( $target.hasClass(opt.pageSlideClass) ) {
							storage = parseInt($target.attr('data-page'));
							public.toSlide(storage);
						} else if ( $target.hasClass(opt.prevSlideClass) ) {
							public.prevSlide();
						} else if ( $target.hasClass(opt.nextSlideClass) ) {
							public.nextSlide();
						}
					});
			},
			createPagination: function () {
				var $pagesList;

				if (DOM.$pagination) {
					DOM.$pagination.empty();
					DOM.$pagination.detach();
				} else {
					DOM.$pagination = $('<div>').addClass( opt.paginationHolderClass );
				}

				$('<span>')
					.addClass( opt.prevSlideClass )
					.html(opt.prevSlideHtml)
					.appendTo( DOM.$pagination );

				$pagesList = $('<ul>')
					.addClass( opt.lablesHolderClass )
					.appendTo( DOM.$pagination );

				for (var i = 0; i < slidesLength; i++) {
					$('<li>')
						.addClass(opt.pageSlideClass)
						.html( opt.pageSlideHtml ? opt.pageSlideHtml : i + 1 )
						.attr( 'data-page', i )
						.appendTo( $pagesList );
				}

				$('<span>')
					.addClass( opt.nextSlideClass )
					.html(opt.nextSlideHtml)
					.appendTo( DOM.$pagination );
				DOM.$pagination.appendTo($slider);
			},
			getTransitionDuration: function($el) {
				// check the main transition duration property
				if($el.css('transition-duration')) {
					return Math.round(parseFloat($el.css('transition-duration')) * 1000);
				}
				else {
					// check the vendor transition duration properties
					if($el.css('-webkit-transtion-duration')) return Math.round(parseFloat($el.css('-webkit-transtion-duration')) * 1000);
					if($el.css('-moz-transtion-duration')) return Math.round(parseFloat($el.css('-moz-transtion-duration')) * 1000);
					if($el.css('-ms-transtion-duration')) return Math.round(parseFloat($el.css('-ms-transtion-duration')) * 1000);
					if($el.css('-o-transtion-duration')) return Math.round(parseFloat($el.css('-ms-transtion-duration')) * 1000);
				}
				// if we're here, then no transition duration was found, return 0
				return 0;
			},
			getTransitionDelay: function($el) {
				// check the main transition duration property
				if($el.css('transition-delay')) {
					return Math.round(parseFloat($el.css('transition-delay')) * 1000);
				}
				else {
					// check the vendor transition duration properties
					if($el.css('-webkit-transtion-delay')) return Math.round(parseFloat($el.css('-webkit-transtion-delay')) * 1000);
					if($el.css('-moz-transtion-delay')) return Math.round(parseFloat($el.css('-moz-transtion-delay')) * 1000);
					if($el.css('-ms-transtion-delay')) return Math.round(parseFloat($el.css('-ms-transtion-delay')) * 1000);
					if($el.css('-o-transtion-delay')) return Math.round(parseFloat($el.css('-ms-transtion-delay')) * 1000);
				}
				// if we're here, then no transition duration was found, return 0
				return 0;
			},
			getAnimationDuration: function($el) {
				// check the main animation duration property
				if($el.css('animation-duration')) {
					return Math.round(parseFloat($el.css('animation-duration')) * 1000);
				}
				else {
					// check the vendor animation duration properties
					if($el.css('-webkit-animation-duration')) return Math.round(parseFloat($el.css('-webkit-animation-duration')) * 1000);
					if($el.css('-moz-animation-duration')) return Math.round(parseFloat($el.css('-moz-animation-duration')) * 1000);
					if($el.css('-ms-animation-duration')) return Math.round(parseFloat($el.css('-ms-animation-duration')) * 1000);
					if($el.css('-o-animation-duration')) return Math.round(parseFloat($el.css('-ms-animation-duration')) * 1000);
				}
				// if we're here, then no animation duration was found, return 0
				return 0;
			},
			getAnimationDelay: function($el) {
				// check the main animation duration property
				if($el.css('animation-delay')) {
					return Math.round(parseFloat($el.css('animation-delay')) * 1000);
				}
				else {
					// check the vendor animation duration properties
					if($el.css('-webkit-animation-delay')) return Math.round(parseFloat($el.css('-webkit-animation-delay')) * 1000);
					if($el.css('-moz-animation-delay')) return Math.round(parseFloat($el.css('-moz-animation-delay')) * 1000);
					if($el.css('-ms-animation-delay')) return Math.round(parseFloat($el.css('-ms-animation-delay')) * 1000);
					if($el.css('-o-animation-delay')) return Math.round(parseFloat($el.css('-ms-animation-delay')) * 1000);
				}
				// if we're here, then no animation duration was found, return 0
				return 0;
			},
			getAnimationTime: function ($el) {
				var duration, delay;
				duration = _.getAnimationDuration($el);
				delay = _.getAnimationDelay($el);
				// console.log(duration);
				// console.log(delay);
				return delay + duration;
			},
			filterSlides: function (id) {
				var i = 0,
					found = false,
					result = [];
				for (i; i < slides.length; i++) {
					if (slides[i].id === id) {
						result.push(slides[i].$el);
						found = true;
					} else {
						if (found) break;
					}
				}
				return result;
			},
			activeSlides: function (id) {
				if (typeof id !== "number") return;
				var i,
					elements = _.filterSlides(id);
				for (i = 0; i < elements.length; i++) {
					elements[i]
						.addClass(opt.activeClass)
						.addClass(opt.animationInClass);
					setTimeout((function ($el) {
						return function () {
							$el
								.removeClass(opt.animationInClass);
							locked = false;
						}
					})(elements[i]), _.getAnimationTime(elements[i]) );
				}
			},
			deactiveSlides: function (id) {
				if (typeof id !== "number") return;
				var i,
					elements = _.filterSlides(id);
				for (i = 0; i < elements.length; i++) {
					elements[i].addClass(opt.animationOutClass);
					setTimeout((function ($el) {
						return function () {
							$el
								.removeClass(opt.activeClass)
								.removeClass(opt.animationOutClass);
						}
					})(elements[i]), _.getAnimationTime(elements[i]) );
				}
			}
		};
		public = {
			init: function () {
				_.defineSlides();
				if (opt.pagination) _.createPagination();
				_.bindEvents();
				public.toSlide(opt.startSlide);
			},
			toSlide: function (id) {
				if (locked) return
				if (typeof id !== "number" || id < 0 || slidesLength < id ) return;
				if (id === currentSlide) return;
				locked = true;
				$slider.addClass(opt.transitionClass);
				_.deactiveSlides(currentSlide);
				_.activeSlides(id);
				currentSlide = id;
				// console.log(id);
			},
			prevSlide: function () {
				var id = currentSlide - 1;
				if (id < 0) {
					return;
				}
				public.toSlide(id);
			},
			nextSlide: function () {
				var id = currentSlide + 1;
				if (id >= slidesLength) {
					return;
				}
				public.toSlide(id);
			}
		};
		public.init();
		return public;
	};

	if (this.length > 1) {
		return this.map(plugin);
	} else if (this.length === 1) {
		return plugin.call(this[0]);
	}
};

})(jQuery);
$('.double-slider').doubleSlider();
