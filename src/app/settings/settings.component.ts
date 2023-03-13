import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from "../../environments/environment";
import { AuthenticationService, UserService } from "../_services";
import { UserMaintenanceService } from "../_services/user-maintenance.service";
import { LibraryService } from "../_services/library.service";
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthGuard } from "../_guards";
import { ToastrService } from 'ngx-toastr';
import {ConfirmModalComponent, ModalConfig} from '../_common/confirm-modal';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
	
	currentUser = this.authenticationService.currentUserValue;
	is_admin = this.currentUser.short_codes.includes('is_admin');
	library_id = this.currentUser.library_id;
	name =  '';
	email=  '';
	address=  '';
	phone=  '';
	site_styles = [];
	loading = false;
	loading2 = false;
	allow_children_curation = 1;
	selectedTheme = new UntypedFormControl([]);
	limitCuration = new UntypedFormControl([]);
	lockDisabled = new UntypedFormControl([]);
  	show_read_progress = new UntypedFormControl([0]);
	is_parent = false;

	dropdownSettings = {}; 
	libraries = [];

	readerUserName = '';
	modalContinueText = '';

	curation_disabled = false;
	temp_hidden = true;

	/** declare form inputs */
	connectForm = new UntypedFormGroup({
		username: new UntypedFormControl('', [ Validators.required]),
		pwd: new UntypedFormControl('', [ Validators.required])
	});

	// modal for deleting Profile
  	@ViewChild('modalContinue')  modalContinue: ConfirmModalComponent;
  
  	modalContinueConfig: ModalConfig = {
    	modalTitle: 'Warning',
		onDismiss: () => {
			return true;
		},
		dismissButtonLabel: 'Yes',
		onClose: () => {
  			return false;
		},
		closeButtonLabel: 'No',
		backdropStatic: true,
  	}

  constructor(
  	private libraryService: LibraryService,
    private authenticationService: AuthenticationService,
	public guard: AuthGuard,
	private userService: UserService,
	private toastr:ToastrService,
	private userMaintenanceService: UserMaintenanceService,
  	) { }

  ngOnInit() {
  	this.getInfo();

	  this.dropdownSettings= {
		singleSelection: true,
		closeDropDownOnSelection: true,
		idField: 'id',
		textField: 'name',      
		allowSearchFilter: true
	  };
	
	  this.getLibraryList();

	  this.libraryService.getLibraryNodes(this.library_id)
	  .subscribe(res => {    
		if(res.length > 1){
		  this.is_parent = true;        	
		}			  		     
	  });  
  }

  async getInfo() {
  	let res = await this.getLibData();
  	this.setInfo(res);
  	this.getSiteStyles();
	this.userService.getMe().subscribe( data => {
		this.readerUserName = data.user_reader;
	  }, err => {});;
  }

  setInfo(res) {
  	this.name = res.name;
	this.email = res.payment_email;
  	this.phone = res.phone,
  	this.address = res.address1 + ', ' + res.city + ' ' + res.zip;	
	this.selectedTheme.setValue(res.site_style_id)
  	this.limitCuration.setValue(res.allow_children_curation)
  	this.lockDisabled.setValue(0)
    this.show_read_progress.setValue(Number(res.show_read_progress));

    this.check_user_curate(this.currentUser.library_id);
  }

  getLibData() {
  	 return new Promise(resolve => {
	  this.libraryService.getLibrary(this.library_id)
	    .subscribe(res => {
        	 resolve(res);
	    });
	   });
   }


    getSiteStyles(){
	  this.libraryService.getSiteStyles()
	    .subscribe(res => {
	    	this.site_styles = res;
	    });    
	}

	setTemplate() {
		this.loading = true;
		this.libraryService.updateLibrary(this.library_id, 
			{ site_style_id: this.selectedTheme.value, 
			  show_read_progress: Number(this.show_read_progress.value)			  
			})    
      	.subscribe(res => { this.loading = false;}); 
	}

	setCollection() {
		this.loading2 = true;	
		this.libraryService.updateLibrary(this.library_id, 
			{ allow_children_curation: Number(this.limitCuration.value) })    
      	.subscribe(res => { this.loading2 = false;}); 
	}


	connectUser() {
		this.userService.setIverseUserToCms(this.connectForm.value)
		  	.subscribe(
		      data => {
				  if (data.message) {
						this.toastr.error(data.message, 'Invalid!');
					  return;
				  }
				this.readerUserName = data.account;
		      },
		      err => {
				this.toastr.error('Invalid credentials!', 'Invalid!');
		      });;
	}

	disconnectUser() {
		this.userService.remIverseUserToCms()
		  	.subscribe(
		      data => {
				this.readerUserName = '';
		      },
		      err => { });;
	}


	getLibraryList(){
		this.libraryService.getLibrariesList()
		.subscribe(res => {
		  this.libraries = res.items;      
		});
	  }
	
	  onLibrarySelect(item: any){                    
		this.library_id = parseInt(item.id);    
		this.getInfo();
	  }
	
	  onLibraryDeSelect(item: any){        
		this.library_id = null;   
	
	}

	async openContinueModal() {		
		const limitVal = this.limitCuration.value;
		const newVal = limitVal == "1" ? "0" : "1";
		const text = limitVal == "1" ? "" : "not ";
		this.modalContinueText = "If selected member accounts can "+text+"make changes to their individual collections. Would you like to proceed?";

		let allow = await this.modalContinue.open();			

		if(allow){
			this.setCollection();
		}
		else {
			this.limitCuration.setValue(newVal)
		}		
	}

	onCheckMark(event, curation_disabled) {
		if(curation_disabled) {
			event.preventDefault();
		}
	}

	check_user_curate(lib_id: number) {
	    if (this.is_admin) {
	      this.curation_disabled = false;
	      return false;
	    }
	    this.userMaintenanceService.check_user_can_curate(lib_id)
	      .subscribe(res => {
	        this.curation_disabled = !res;
	      });
	}

}
