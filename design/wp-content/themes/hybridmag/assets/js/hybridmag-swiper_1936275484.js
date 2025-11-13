const hybridmagSwiperConfig = {
    speed: 400,
    effect: 'slide',
    init: true,
    // Navigation arrows
    navigation: {
        disabledClass: 'hm-swiper-button-disabled',
        hiddenClass: 'hm-swiper-button-hidden',
        lockClass: 'hm-swiper-button-lock',
        nextEl: '.hm-swiper-button-next',
        prevEl: '.hm-swiper-button-prev',
    },
    ../../../../../https/if we need pagination    pagination_1161521515.html{
        el: '.hm-swiper-pagination',
        clickable: true,
        bulletActiveClass: 'hm-swiper-pagination-bullet-active',
        bulletClass: 'hm-swiper-pagination-bullet',
        clickableClass: 'hm-swiper-pagination-clickable',
        currentClass: 'hm-swiper-pagination-current',
        hiddenClass: 'hm-swiper-pagination-hidden',
        horizontalClass: 'hm-swiper-pagination-horizontal',
        lockClass: 'hm-swiper-pagination-lock',
        modifierClass: 'hm-swiper-pagination-',
        paginationDisabledClass: 'hm-swiper-pagination-disabled',
        progressbarFillClass: 'hm-swiper-pagination-progressbar-fill',
        progressbarOppositeClass: 'hm-swiper-pagination-progressbar-opposite',
        totalClass: 'hm-swiper-pagination-total',
        verticalClass: 'hm-swiper-pagination-vertical'
    },
    loop: true,
    preloadImages: false,
    containerModifierClass: 'hm-swiper-',
    noSwipingClass: 'hm-swiper-no-swiping',
    slideActiveClass: 'hm-swiper-slide-active',
    slideBlankClass: 'hm-swiper-slide-invisible-blank',
    slideClass: 'hm-swiper-slide',
    slideDuplicateActiveClass: 'hm-swiper-slide-duplicate-active',
    slideDuplicateClass: 'hm-swiper-slide-duplicate',
    slideDuplicateNextClass: 'hm-swiper-slide-duplicate-next',
    slideDuplicatePrevClass: 'hm-swiper-slide-duplicate-prev',
    slideNextClass: 'hm-swiper-slide-next',
    slidePrevClass: 'hm-swiper-slide-prev',
    slideVisibleClass: 'hm-swiper-slide-visible',
    wrapperClass: 'hm-swiper-wrapper'
}

if ( hybridmag_swiper_object.autoplay === "1" ) {
    hybridmagSwiperConfig.autoplay = {
        delay: hybridmag_swiper_object.delay * 1000,
        pauseOnMouseEnter: true,
        disableOnInteraction: true
    };
}

const hmThemeSwiper = new Swiper( '.hm-swiper', hybridmagSwiperConfig ); 