import type { Answerable, Question, QuestionAdapter } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import { By, Click, ExecuteScript, Key, PageElement, Press, Text } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';

export class Lightbox<NET> extends InteractionObject<NET> {

    private captionElement = () =>
        this.child(By.css('.lightbox-caption'))
            .describedAs('lightbox caption');

    private prevButton = () =>
        this.child(By.css('.lightbox-prev'))
            .describedAs('lightbox previous button');

    private nextButton = () =>
        this.child(By.css('.lightbox-next'))
            .describedAs('lightbox next button');

    isOpen = (): Answerable<boolean> =>
        (this.rootElement as PageElement<NET>).isPresent();

    caption = (): QuestionAdapter<string> =>
        this.captionElement().text().trim()
            .describedAs('lightbox caption text');

    counter = (): QuestionAdapter<string> =>
        this.captionElement().text().trim()
            .describedAs('lightbox counter');

    hasPrevButton = (): Question<Promise<boolean>> =>
        this.prevButton().isPresent()
            .describedAs('whether lightbox has previous button');

    hasNextButton = (): Question<Promise<boolean>> =>
        this.nextButton().isPresent()
            .describedAs('whether lightbox has next button');

    next = (): Task =>
        Task.where('#actor navigates to the next photo',
            Press.the(Key.ArrowRight),
        );

    prev = (): Task =>
        Task.where('#actor navigates to the previous photo',
            Press.the(Key.ArrowLeft),
        );

    clickNext = (): Task =>
        Task.where('#actor clicks the next photo button',
            Click.on(this.nextButton()),
        );

    clickPrev = (): Task =>
        Task.where('#actor clicks the previous photo button',
            Click.on(this.prevButton()),
        );

    close = (): Task =>
        Task.where('#actor closes the lightbox',
            Press.the(Key.Escape),
        );

    closeByOverlayClick = (): Task =>
        Task.where('#actor closes the lightbox by clicking the overlay',
            ExecuteScript.sync(`document.querySelector('.lightbox-overlay').dispatchEvent(new MouseEvent('click', { bubbles: true }))`),
        );
}

export class PhotoStrip<NET> extends InteractionObject<NET> {

    readonly lightbox: Lightbox<unknown>;

    constructor(rootElement: Answerable<PageElement<NET>>) {
        super(rootElement as PageElement<NET> | QuestionAdapter<PageElement<NET>>);
        this.lightbox = new Lightbox(
            PageElement.located(By.css('.lightbox-overlay')).describedAs('lightbox overlay'),
        );
    }

    private titleElement = () =>
        this.child(By.css('.card-title'))
            .describedAs('photo strip title');

    private thumbnails = () =>
        this.children(By.css('.photo-strip-item'))
            .describedAs('photo strip thumbnails');

    private thumbnailImages = () =>
        this.children(By.css('.photo-strip-item img'))
            .describedAs('photo strip thumbnail images');

    private captions_ = () =>
        this.children(By.css('.photo-strip-caption'))
            .describedAs('photo strip captions');

    title = (): QuestionAdapter<string> =>
        this.titleElement().text().trim()
            .describedAs('photo strip title');

    photoCount = (): Question<Promise<number>> =>
        this.thumbnails().count()
            .describedAs('number of photos');

    captions = (): Question<Promise<string[]>> =>
        this.captions_()
            .eachMappedTo(Text)
            .describedAs('photo captions');

    openPhoto = (index: number): Task =>
        Task.where(`#actor opens photo at index ${ index }`,
            Click.on(this.thumbnailImages().nth(index).describedAs(`photo thumbnail #${ index }`)),
        );
}
