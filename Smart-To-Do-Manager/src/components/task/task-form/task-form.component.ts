import { Component, EventEmitter, Input, Output, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Priority } from '../../../interfaces/task.interface';

@Component({
    selector: 'app-task-form',
    templateUrl: './task-form.component.html',
    styleUrl: './task-form.component.css',
    standalone: true,
    imports: [FormsModule],
})
export class TaskFormComponent {
    @Input() editingTask: any = null;
    @Output() taskSubmitted = new EventEmitter<any>();
    @Output() editCancelled = new EventEmitter<void>();

    // Angular 18 signals for reactive state
    title = signal('');
    description = signal('');
    priority = signal<Priority>(Priority.MEDIUM);
    tags = signal<string[]>([]);
    newTag = signal('');
    showDetails = signal(false);
    isSubmitting = signal(false);

    ngOnChanges(): void {
        if (this.editingTask) {
            this.title.set(this.editingTask.title);
            this.description.set(this.editingTask.description || '');
            this.priority.set(this.editingTask.priority);
            this.tags.set([...this.editingTask.tags]);
            this.showDetails.set(true);
        } else {
            this.resetForm();
        }
    }

    async onSubmit(): Promise<void> {
        if (this.title().trim() && !this.isSubmitting()) {
            this.isSubmitting.set(true);

            try {
                const taskData = {
                    title: this.title().trim(),
                    description: this.description().trim(),
                    priority: this.priority(),
                    tags: [...this.tags()] // Create a copy
                };

                // Simulate async operation for better UX
                await new Promise(resolve => setTimeout(resolve, 300));

                this.taskSubmitted.emit(taskData);

                if (!this.editingTask) {
                    this.resetForm();
                }
            } finally {
                this.isSubmitting.set(false);
            }
        }
    }

    addTag(event: Event): void {
        event.preventDefault();
        const tagValue = this.newTag().trim();

        if (tagValue && !this.tags().includes(tagValue)) {
            this.tags.update(currentTags => [...currentTags, tagValue]);
            this.newTag.set('');
        }
    }

    removeTag(tag: string): void {
        this.tags.update(currentTags => currentTags.filter(t => t !== tag));
    }

    toggleDetails(): void {
        this.showDetails.update(current => !current);
    }

    cancelEdit(): void {
        this.editCancelled.emit();
        this.resetForm();
    }

    trackByTag(index: number, tag: string): string {
        return tag;
    }

    private resetForm(): void {
        this.title.set('');
        this.description.set('');
        this.priority.set(Priority.MEDIUM);
        this.tags.set([]);
        this.newTag.set('');
        this.showDetails.set(false);
        this.isSubmitting.set(false);
    }
}