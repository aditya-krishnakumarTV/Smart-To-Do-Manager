import { Component, signal, computed, effect, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Priority, TaskFilter } from '../../../interfaces/task.interface';

@Component({
    selector: 'app-task-filters',
    templateUrl: './task-filters.component.html',
    styleUrl: './task-filters.component.css',
    standalone: true,
    imports: [FormsModule],
})
export class TaskFiltersComponent {
    availableTags = input<string[]>([]);
    filtersChanged = output<TaskFilter>();

    // Angular 18 signals for reactive state
    searchTerm = signal('');
    selectedPriority = signal('');
    completedFilter = signal('');
    selectedTags = signal<string[]>([]);

    // Computed signal for active filters count
    activeFiltersCount = computed(() => {
        let count = 0;
        if (this.searchTerm().trim()) count++;
        if (this.selectedPriority()) count++;
        if (this.completedFilter() !== '') count++;
        if (this.selectedTags().length > 0) count++;
        return count;
    });

    constructor() {
        // Angular 18 effect to emit filter changes
        effect(() => {
            this.emitFilters();
        });
    }

    onSearchInput(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.searchTerm.set(target.value);
    }

    onPriorityChange(event: Event): void {
        const target = event.target as HTMLSelectElement;
        this.selectedPriority.set(target.value);
    }

    onStatusChange(event: Event): void {
        const target = event.target as HTMLSelectElement;
        this.completedFilter.set(target.value);
    }

    toggleTag(tag: string): void {
        this.selectedTags.update(currentTags => {
            const index = currentTags.indexOf(tag);
            if (index > -1) {
                return currentTags.filter(t => t !== tag);
            } else {
                return [...currentTags, tag];
            }
        });
    }

    clearFilters(): void {
        this.searchTerm.set('');
        this.selectedPriority.set('');
        this.completedFilter.set('');
        this.selectedTags.set([]);
    }

    hasActiveFilters(): boolean {
        return this.activeFiltersCount() > 0;
    }

    trackByTag(index: number, tag: string): string {
        return tag;
    }

    private emitFilters(): void {
        const filters: TaskFilter = {};

        const search = this.searchTerm().trim();
        if (search) {
            filters.search = search;
        }

        const priority = this.selectedPriority();
        if (priority) {
            filters.priority = priority as Priority;
        }

        const completed = this.completedFilter();
        if (completed !== '') {
            filters.completed = completed === 'true';
        }

        const tags = this.selectedTags();
        if (tags.length > 0) {
            filters.tags = [...tags];
        }

        this.filtersChanged.emit(filters);
    }
}