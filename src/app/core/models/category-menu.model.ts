export interface CategoryMenu {
    id: string;
    name: string;
    icon?: string;
    link?: boolean;
    open?: boolean;
    chip: object;
    sub?: object;
}
