public with sharing class expenseManagementSystem {
    public expenseManagementSystem() {

    }
    @AuraEnabled(cacheable=true)
    public static List<Expense__c>  getExpenseRecord(){
            return [select Amount__c,Expense_Type__c,Status__c  from Expense__c Order By CreatedDate DESC];
        
    }
    @AuraEnabled(cacheable=true)
    public static List<Expense__c> searchExpenseRecord(String searchValue) {
        String searchTerm = '%' + searchValue + '%';
        List<Expense__c> searchResults = [
            SELECT Amount__c, Expense_Type__c, Status__c
            FROM Expense__c
            WHERE Status__c LIKE :searchTerm OR Expense_Type__c LIKE :searchTerm
        ];
    
        return searchResults;
    }
    

    
}