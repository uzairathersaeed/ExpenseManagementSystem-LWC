import { LightningElement, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import getExpenseRecord from "@salesforce/apex/expenseManagementSystem.getExpenseRecord";
import searchExpenseRecord from "@salesforce/apex/expenseManagementSystem.searchExpenseRecord";
import { deleteRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";

const actions = [{ label: "Delete", name: "delete" }];
const columnData = [
  {
    label: "Amount",
    fieldName: "Amount__c",
    sortable: "true"
  },
  { label: "Expense Type", fieldName: "Expense_Type__c", sortable: "true" },
  { label: "Status", fieldName: "Status__c", sortable: "true" },
  {
    type: "action",
    typeAttributes: { rowActions: actions }
  }
];
export default class ExpenseManagementSyst extends NavigationMixin(
  LightningElement
) {
  columns = columnData;
  result;
  error;
  isModalOpen = false;
  wiredResult;
  isLoading = true;
  sortedBy;
  sortedDirection;
  searchValue = "";
  showModal() {
    this.isModalOpen = true;
  }
  closeModal() {
    this.isModalOpen = false;
  }

  //Data Fetching
  @wire(getExpenseRecord)
  allExpenserecord(result) {
    this.wiredResult = result;
    if (result.data) {
      console.log("result submitted", result.data);
      this.result = result.data;
      this.error = undefined;
      this.isLoading = false;
      console.log("result submitted", result.data);
    } else if (result.error) {
      this.error = result.error;
      this.result = undefined;
    }
  }
  @wire(searchExpenseRecord, { searchValue: "$searchValue" })
  searchRecord({ error, data }) {
    if (data) {
      this.result = data;
    } else if (error) {
      console.log("Error", JSON.stringify(error));
    }
  }
  //Searching Functionality
  handleChange(event) {
    this.searchValue = event.target.value;
    console.log(this.searchValue);
  }

  // Sorting Part
  onSort(event) {
    this.sortedBy = event.detail.fieldName; //like order by field name
    this.sortedDirection = event.detail.sortedDirection; //order by desc or asc

    this.sortDataTable(this.sortedBy, this.sortedDirection);
  }
  sortDataTable(fieldName, direction) {
    let sortResult = [...this.result];
    let dataType = "text";

    if (!isNaN(this.result[0][fieldName])) {
      dataType = "number";
    }

    sortResult.sort((a, b) => {
      let valueA = a[fieldName];
      let valueB = b[fieldName];

      if (dataType === "text") {
        valueA = valueA ? valueA.toLowerCase() : "";
        valueB = valueB ? valueB.toLowerCase() : "";
      }

      if (valueA > valueB) {
        return direction === "asc" ? 1 : -1;
      } else if (valueA < valueB) {
        return direction === "asc" ? -1 : 1;
      }
      return 0;
    });

    this.result = sortResult;
  }
  //   getting action name and record id as well
  handleRowAction(event) {
    const actionName = event.detail.action.name;
    console.log("actionName", JSON.stringify(actionName));
    const rowId = event.detail.row.Id;
    console.log("rowId", JSON.stringify(rowId));
    this.deleteRecord(rowId);
  }
  // deleting the record
  deleteRecord(recordId) {
    this.isLoading = true;

    deleteRecord(recordId)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Record Deleted Successfully",
            variant: "success"
          })
        );
      })
      .catch((error) => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error",
            message: error.body.message,
            variant: "error"
          })
        );
      })
      .finally(() => {
        this.isLoading = false;
        return refreshApex(this.wiredResult);
      });
  }

  //when Data is created from lightning record form
  handleSuccess() {
    this.closeModal();
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Success",
        message: "Record Add Successfully",
        variant: "success"
      })
    );
    return refreshApex(this.wiredResult).catch((error) => {
      console.error("Error refreshing data:", error);
    });
  }
}
