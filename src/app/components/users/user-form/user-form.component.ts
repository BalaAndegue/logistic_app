// components/users/user-form/user-form.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { User, UserFormData, UserRole } from '../../../models/user.model';

@Component({
    selector: 'app-user-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './user-form.component.html',
    styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
    @Input() user: User | null = null;
    @Input() isEditing = false;
    @Output() submit = new EventEmitter<Partial<User>>();
    @Output() cancel = new EventEmitter<void>();

    userForm: FormGroup;
    roles: UserRole[] = ['ADMIN' , 'MANAGER' , 'SUPERVISOR' , 'USER'];
    loading = false;

    constructor(private fb: FormBuilder) {
        this.userForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            role: ['user', Validators.required],
            phone: [''],
            password: ['', this.isEditing ? [] : [Validators.required, Validators.minLength(6)]],
            password_confirmation: ['']
        }, { validators: this.passwordMatchValidator });
    }

    ngOnInit() {
        if (this.user) {
            this.userForm.patchValue({
                name: this.user.name,
                email: this.user.email,
                role: this.user.role,
                phone: this.user.phone || '',
                password: '', // Ne pas remplir le mot de passe
                password_confirmation: ''
            });

            // Pour l'édition, le mot de passe n'est pas obligatoire
            if (this.isEditing) {
                this.userForm.get('password')?.clearValidators();
                this.userForm.get('password')?.updateValueAndValidity();
            }
        }
    }

    passwordMatchValidator(form: FormGroup) {
        const password = form.get('password')?.value;
        const confirm = form.get('password_confirmation')?.value;
        return password === confirm ? null : { mismatch: true };
    }

    onSubmit() {
        if (this.userForm.valid) {
            this.loading = true;
            const formValue = this.userForm.value;
            
            // N'envoyer le mot de passe que s'il est rempli
            const userData: Partial<UserFormData> = {
                name: formValue.name,
                email: formValue.email,
                role: formValue.role,
                phone: formValue.phone || null
            };

            if (formValue.password) {
                userData.password = formValue.password;
                userData.password_confirmation = formValue.password_confirmation;
            }

            this.submit.emit(userData);
        }
    }

    onCancel() {
        this.cancel.emit();
    }
}