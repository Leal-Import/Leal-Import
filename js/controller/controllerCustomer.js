import {
    getCustomers,
    postCustomer,
    putCustomer 
} from '../service/serviceCustomers.js';
import{
    setupModal
} from '../utils.js';

// Configurar el modal para agregar empleados
setupModal("#openModalCustomer", "#modalCustomers", "#closeAddCustomer", "#frmCustomers");


