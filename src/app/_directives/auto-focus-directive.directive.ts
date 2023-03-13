import { AfterContentInit, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appAutoFocusDirective]'
})
export class AutoFocusDirectiveDirective implements AfterContentInit{
  @Input() public appAutoFocus: boolean;
  constructor(private el: ElementRef) { }

  public ngAfterContentInit(): void {
    setTimeout(() => {
      this.el.nativeElement.focus();
    }, 10);
  }
}
