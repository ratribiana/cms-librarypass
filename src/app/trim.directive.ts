import {
    Directive,
    ElementRef,
    Output,
    EventEmitter,
} from '@angular/core';
@Directive({
    selector: '[trim]',
    host: {
        '(blur)': 'onBlur()'
    }
})

/**
 * To use this add attribute '[(ngModel)]="element_name_here" trim'
 * e.g <input type="text" formControlName="username" class="form-control" autocomplete="off" [ngClass]="{ 'is-invalid': submitted && f.username.errors }" [(ngModel)]="username" trim />
 */
export class TrimDirective {
    @Output() ngModelChange: EventEmitter < any > = new EventEmitter();
    constructor(private element: ElementRef) {}
    onBlur() {
        (this.element.nativeElement as HTMLInputElement).value = (this.element.nativeElement as HTMLInputElement).value.trim();
        this.ngModelChange.emit((this.element.nativeElement as HTMLInputElement).value.trim());
    }
}