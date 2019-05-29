import { Component, Output, EventEmitter, ViewChild } from '@angular/core';
import { NamespacesService } from '../services/namespaces.service';
import LuigiClient from '@kyma-project/luigi-client';
import { ModalService, ModalComponent } from 'fundamental-ngx';

@Component({
  selector: 'app-namespace-create',
  templateUrl: './namespace-create.component.html',
  styleUrls: ['./namespace-create.component.scss']
})
export class NamespaceCreateComponent {
  @Output() cancelEvent: EventEmitter<any> = new EventEmitter();

  @ViewChild('createNamespaceModal') createNamespaceModal: ModalComponent;

  // default values
  public isActive: boolean;
  public namespaceName: string;
  public labels: string[];
  public memoryLimits: string;
  public memoryRequests: string;
  public max: string;
  public default: string;
  public defaultRequest: string;

  // checkboxes
  public istioInjectionEnabled: boolean;
  public resourceQuotasExpanded: boolean;
  public limitRangesExpanded: boolean;

  // input errors
  public err: string;
  public wrongName: boolean;
  public wrongLabels: boolean;
  public memoryLimitsError: boolean;
  public memoryRequestsError: boolean;
  public maxError: boolean;
  public defaultError: boolean;
  public defaultRequestError: boolean;

  public regexErrorMessage = 'Regex error arrrrrrrr. Regex error arrrrrrrr.';

  constructor(
    private namespacesService: NamespacesService,
    private modalService: ModalService
  ) {}

  public createNamespace() {
    this.namespacesService.createNamespace(
      this.namespaceName, 
      this.labelsArrayToObject()
    ).subscribe(
      () => {

        const handleSuccess = () => {
          this.isActive = false;
          this.refreshContextSwitcher();
          this.navigateToDetails(this.namespaceName);
        }

        if (this.resourceQuotasExpanded && this.limitRangesExpanded) {
          this.createResourceQuotaAndLimitRange().subscribe(() => {
            handleSuccess();
          }, err => {
            this.refreshContextSwitcher();
            this.err = `Namespace has been created, but there was an error while creating Limits: ${err}`;
          });
        } else if (this.resourceQuotasExpanded && !this.limitRangesExpanded) {
          this.createResourceQuota()
          .subscribe(() => {
            handleSuccess();
          }, err => {
            this.refreshContextSwitcher();
            this.err = `Namespace has been created, but there was an error while creating Resource Quota: ${err}`;
          });
        } else if (this.limitRangesExpanded && !this.resourceQuotasExpanded) {
          this.createLimitRange()
          .subscribe(() => {
            handleSuccess();
          }, err => {
            this.refreshContextSwitcher();
            this.err = `Namespace has been created, but there was an error while creating Limit Range: ${err}`;
          });
        }

      }, 
      err => {
        this.err = err;
      }
    );
  }

  public createResourceQuotaAndLimitRange() {
    return this.namespacesService.createResourceQuotaAndLimitRange(
      this.namespaceName,
      this.memoryLimits, 
      this.memoryRequests,
      this.default,
      this.defaultRequest,
      this.max
    );
  }

  public createResourceQuota() {
    return this.namespacesService.createResourceQuota(
      this.namespaceName,
      this.memoryLimits, 
      this.memoryRequests
    );
  }

  public createLimitRange() {
    return this.namespacesService.createLimitRange(
      this.namespaceName,
      this.default,
      this.defaultRequest,
      this.max
    );
  }

  public cancel() {
    if(this.modalService) {
      this.modalService.close(this.createNamespaceModal);
    }
  }

  public show() {
    this.setDefaultValues();
    this.modalService.open(this.createNamespaceModal).result.finally(() => {
      this.isActive = false;
      this.wrongName = false;
      this.cancelEvent.emit();
    });
  }

  public navigateToDetails(namespaceName) {
    LuigiClient.linkManager().navigate(`/home/namespaces/${namespaceName}/details`);
  }

  public validateRegex() {
    const regex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;
    this.namespaceName
      ? (this.wrongName = !regex.test(this.namespaceName))
      : (this.wrongName = false);
  }

  public validateLimitsRegex(change, name) {
    const regex = /^([+-]?[0-9.]+)([eEinumkKMGTP]*[-+]?[0-9]*)$/;
    change ? (this[name] = !regex.test(change)) : (this[name] = false)
  }

  public validateMemoryRequests(change) {
    this.memoryRequestsError = isNaN(change);
  }

  private refreshContextSwitcher() {
    window.parent.postMessage({ msg: 'luigi.refresh-context-switcher' }, '*');
  }

  public updateLabels({
    labels,
    wrongLabels
  }: {
    labels?: string[];
    wrongLabels?: boolean;
  }): void {
    if (labels) {

      // disable 'istio injection' button if label has been removed.
      const istioLabel = labels.find(this.findIstioLabel);
      if (istioLabel) {
        const value = istioLabel.split('=')[1];
        this.istioInjectionEnabled = value === 'true';
      } else {
        this.istioInjectionEnabled = false;
      }
    }
    this.labels = labels !== undefined ? labels : this.labels;
    this.wrongLabels = wrongLabels !== undefined ? wrongLabels : this.wrongLabels;
  }

  public toggleIstioCheck(checked: boolean) {
    if (this.labels && this.labels.length > 0) {
      const istioLabel = this.labels.find(this.findIstioLabel);
      if (istioLabel) {
        this.labels.splice(this.labels.indexOf(istioLabel), 1)
      }
    }
    const istioLabelArray = ['istio-injection', checked.toString()]
    this.labels.push(istioLabelArray.join('='))
  }

  public findIstioLabel(label) {
    const key = label.split('=')[0];
    return key === 'istio-injection'
  }

  public labelsArrayToObject() {
    const labelsObject = {};
    if (this.labels && this.labels.length > 0) {
      this.labels.forEach((label) => {
        const key = label.split('=')[0];
        const value = label.split('=')[1];
        labelsObject[key] = value;
      })
    }
    return labelsObject;
  }

  public setDefaultValues() {
    // default values
    this.isActive = true;
    this.namespaceName = '';
    this.labels = ['istio-injection=true'];
    this.memoryLimits = '3Gi';
    this.memoryRequests = '3006477108';
    this.max = '1Gi';
    this.default = '512Mi';
    this.defaultRequest = '32Mi';

    // checkboxes
    this.istioInjectionEnabled = true;
    this.resourceQuotasExpanded = false;
    this.limitRangesExpanded = false;
  
    // input errors
    this.err = undefined;
    this.wrongName = false;
    this.wrongLabels = false;
    this.memoryLimitsError = false;
    this.memoryRequestsError = false;
    this.maxError = false;
    this.defaultError = false;
    this.defaultRequestError = false;
  }
}

// TODO : write regex