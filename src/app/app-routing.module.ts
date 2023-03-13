import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from "./_guards";
import { LoginComponent } from "./login/login.component";
import { PublisherComponent } from "./publisher/publisher.component";
import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";
import { ResetPasswordComponent } from "./reset-password/reset-password.component";
import { LibrarianComponent } from "./librarian/librarian.component";
import { LibrariesComponent } from "./libraries/libraries.component";
import { UserMaintenanceComponent } from './user-maintenance/user-maintenance.component';
import { LibraryDetailComponent } from './library-detail/library-detail.component';
import { CmsUserComponent } from './cms-user/cms-user.component';
import { CmsUserCreateComponent } from './cms-user/cms-user-create/cms-user-create.component';
import { ProductsComponent } from './products/products.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PromotionsComponent } from './promotions/promotions.component';
import { PromotionDetailComponent } from './promotions/promotion-detail/promotion-detail.component';
import { SettingsComponent } from './settings/settings.component';
import { UserGroupComponent } from './user-group/user-group.component';
import { RolesComponent } from './user-group/roles/roles.component';
import { GroupsComponent } from './user-group/groups/groups.component';
import { superAdminGroup, institutionGroup, publisherGroup, anyGroup, productionGroup } from "./_guards/acl.constants";
import { MarcRecordsComponent } from './marc-records/marc-records.component';
import { ProductionDashboardComponent } from './production-dashboard/production-dashboard.component';
import { ProductCreateComponent } from './products/product-create/product-create.component';
import { UviewComponent } from './uview/uview.component';
import { UnauthorizePageComponent } from "./unauthorize-page/unauthorize-page.component";
import { ContentFilteringComponent } from './content-filtering/content-filtering.component';
import { CanDeactivateGuard } from './_services/can-deactivate-guard.service';


const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: DashboardComponent,
        canActivate: [AuthGuard]
    },

    {
        path: '404',
        component: PageNotFoundComponent
    },

    {
        path: 'unauthorize',
        component: UnauthorizePageComponent
    },

    {
        path: 'login',
        component: LoginComponent
    },

    {
        path: 'reset_password?e=:email&t=:expire_time&s=:hash',
        component: ResetPasswordComponent
    },

    {
        path: 'librarian',
        component: LibrarianComponent,
        canActivate: [AuthGuard],
        data: { userGroups: [anyGroup] }
    },

    {
        path: 'reset_password',
        component: ResetPasswordComponent
    },

    {
        path: 'publisher',
        component: PublisherComponent,
        canActivate: [AuthGuard],
        data: { userGroups: [anyGroup] }
    },

    {
        path: 'user_maintenance',
        component: UserMaintenanceComponent,
        canActivate: [AuthGuard],
        data: { userGroups: [anyGroup] }
    },


    {
        path: 'marc_records',
        component: MarcRecordsComponent,
        canActivate: [AuthGuard]
    },

    {
        path: 'cms_users',
        component: CmsUserComponent,
        canActivate: [AuthGuard],
        data: { userGroups: [anyGroup] }
    },

    {
        path: 'cms_users/create',
        component: CmsUserCreateComponent,
        canActivate: [AuthGuard],
        data: { userGroups: [anyGroup] }
    },


    {
        path: 'cms_users/:id',
        component: CmsUserCreateComponent,
        canActivate: [AuthGuard],
        data: { userGroups: [anyGroup] }
    },


    {
        path: 'libraries',
        component: LibrariesComponent,
        canActivate: [AuthGuard],
        data: { userGroups: [anyGroup] }
    },

    {
        path: 'libraries/create',
        component: LibraryDetailComponent,
        canActivate: [AuthGuard],
        data: { userGroups: [anyGroup] }
    },

    {
        path: 'libraries/:id',
        component: LibraryDetailComponent,
        canActivate: [AuthGuard],
        data: { userGroups: [anyGroup] }
    },
    
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard],
        data: { userGroups: [anyGroup] }
    },
    
    {
        path: 'panelview/:id',
        component: UviewComponent,
        canActivate: [AuthGuard],
        data: { userGroups: [anyGroup] }
    },

    {
        path: 'banners',
        component: PromotionsComponent,
        canActivate: [AuthGuard],
        data: { userGroups: [anyGroup] }
    },

    {
        path: 'drawers',
        component: PromotionsComponent,
        canActivate: [AuthGuard],
        data: { userGroups: [anyGroup] }
    },

    {
        path: 'banners/:id',
        component: PromotionDetailComponent,
        canActivate: [AuthGuard],
        data: { userGroups: [anyGroup] }
    },

    {
        path: 'drawers/:id',
        component: PromotionDetailComponent,
        canActivate: [AuthGuard],
        data: { userGroups: [anyGroup] }
    },

    {
        path: 'products',
        children: [
            {
                path: '',
                pathMatch: 'full',
                component: ProductsComponent,
                canActivate: [AuthGuard],
                data: { userGroups: [anyGroup] }
            },
            {
                path: 'create',
                component: ProductCreateComponent,
                canActivate: [AuthGuard],
                data: { userGroups: [anyGroup] }
            },
            {
                path: 'edit/:id',
                component: ProductCreateComponent,
                canActivate: [AuthGuard],
                data: { userGroups: [anyGroup] }
            },
        ]

    },
    {
        path: 'content-filtering',
        component: ContentFilteringComponent,
        canActivate: [AuthGuard],
        data: { userGroups: [anyGroup] }
    },
    {
        path: 'user-roles',
        children: [
            {
                path: '',
                pathMatch: 'full',
                component: UserGroupComponent,
                canActivate: [AuthGuard],
                data: { userGroups: [superAdminGroup] }
            }, 
            {
                path: 'roles',
                component: RolesComponent,
                canActivate: [AuthGuard],
                data: { userGroups: [superAdminGroup] }
            },
            {
                path: 'roles/:id',
                component: RolesComponent,
                canActivate: [AuthGuard],
                data: { userGroups: [superAdminGroup] }
            }
        ],
    },
    {
        path: 'user-group',
        children: [
            {
                path: '',
                pathMatch: 'full',
                component: UserGroupComponent,
                canActivate: [AuthGuard],
                data: { userGroups: [superAdminGroup] }
            },
            {
                path: 'groups',
                component: GroupsComponent,
                canActivate: [AuthGuard],
                data: { userGroups: [superAdminGroup] }
            },
            {
                path: 'groups/:id',
                component: GroupsComponent,
                canActivate: [AuthGuard],
                data: { userGroups: [superAdminGroup] }
            }
        ],
    },

    {
        path: 'settings',
        component: SettingsComponent,
        canActivate: [AuthGuard],
        data: { userGroups: [anyGroup] }
    },


    {
        path: 'production-dashboard',
        component: ProductionDashboardComponent,
        canActivate: [AuthGuard],
        canDeactivate: [CanDeactivateGuard],
        data: { userGroups: [productionGroup] }
    },
    

    {
        path: '**',
        redirectTo: '/404'
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: [ 
        CanDeactivateGuard
    ]
})
export class AppRoutingModule { }
