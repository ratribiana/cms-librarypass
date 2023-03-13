export class User {
    id: number;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    library_id: number;
    supplier_id: number;
    library_name: string;
    library_dns: string;
    show_patron_info: number;
    supplier_name: string;
    group: string;
    group_id: string;
    role: string[];
    token?: string;
    short_codes: string[];
    url_route: string[];
}