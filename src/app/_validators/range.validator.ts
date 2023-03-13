import { AbstractControl, FormGroup } from '@angular/forms';

export function ValidateRange(from_ip_address: string, to_ip_address: string) {
    return (formGroup: FormGroup) => {
        const from_range = formGroup.controls[from_ip_address];
        const to_range = formGroup.controls[to_ip_address];        

        if (to_range.errors && !to_range.errors.ValidateRange) {
            // return if another validator has already found an error on the matchingControl
            return;
        }

        if(from_range.value && typeof to_range.value != 'number'){
            to_range.setErrors({ ValidateRange: true });
            return;
        }
                
        if(from_range.value && typeof to_range.value == 'number'){
            let range = from_range.value.split(".", 4);                                 
            if (typeof range[3] != 'undefined' && Number(range[3]) > to_range.value) {
                to_range.setErrors({ ValidateRange: true });
            } else {
                to_range.setErrors(null);
            }
        }
    }
}