import { Order } from "./dto/search-order";
import { Pagination } from "./dto/pagination";

const BASE_API = 'http://localhost:8080/pos';
const ORDERS_SERVICE_API = `${BASE_API}/orders`;
const PAGE_SIZE = 6;
const PAGINATION = new Pagination($('.pagination'),PAGE_SIZE,0,searchOrders);

searchOrders();

$('#btn-search').on('click',(eventData)=>{
    eventData.preventDefault();
    searchOrders();
});

$("#txt-search").on('input',()=>{
    searchOrders();
});

function searchOrders():void{
     const http = new XMLHttpRequest();

     http.onreadystatechange = ()=>{

        if(http.readyState !== http.DONE) return;

        console.log(http.status);
        
        if(http.status !== 200){
            alert("Failed to search, something is wrong");
            console.error(http.responseText);
            return;
        }

        const orders: Array<Order> = JSON.parse(http.responseText);
        
        $('#tbl-orders tbody tr').remove();
        orders.forEach((o)=>{
            
            const rowHtml = `<tr>
            <td>${o.orderId}</td>
            <td>${o.orderDate}</td>
            <td>${o.customerId}</td>
            <td>${o.customerName}</td>
            <td>${o.orderTotal.toFixed(2)}</td>
            </tr>
            `;
            $('#tbl-orders tbody').append(rowHtml);
        });        

        PAGINATION.reInitialize(+(http.getResponseHeader('X-Total-Count').split('/')[0]),PAGINATION.selectedPage,PAGE_SIZE);
     }

     http.open('GET',ORDERS_SERVICE_API + `?page=${PAGINATION.selectedPage}&size=${PAGE_SIZE}&q=${$("#txt-search").val()}`);

     http.send();
}
