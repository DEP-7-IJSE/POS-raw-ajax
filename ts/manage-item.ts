import $ from 'jquery';
import { Item } from "./dto/item";
import { Pagination } from './dto/pagination';

const BASE_API = 'http://localhost:8080/pos';
const ITEMS_SERVICE_API = `${BASE_API}/items`;
const PAGE_SIZE = 6;
const PAGINATION = new Pagination($('.pagination'), PAGE_SIZE, 0, loadAllItems);


let items: Array<Item> = [];
let totalItems = 0;

loadAllItems();

function loadAllItems(): void {

    const http = new XMLHttpRequest();

    http.onreadystatechange = () => {

        if (http.readyState === http.DONE) {

            if (http.status !== 200) {
                alert("Failed to fetch items, try again...!");
                return;
            }

            totalItems = +(http.getResponseHeader('X-Total-Count'));
            items = JSON.parse(http.responseText);

            $('#tbl-items tbody tr').remove();

            items.forEach((c) => {
                const rowHtml = `<tr>
                 <td>${c.code}</td>
                 <td>${c.description}</td>
                 <td>${c.qtyOnHand}</td>
                 <td>${c.unitPrice}</td>
                 <td><i class="fas fa-trash trash"></i></td>
                 </tr>` ;


                $('#tbl-items tbody').append(rowHtml);
            });

            PAGINATION.reInitialize(totalItems, PAGINATION.selectedPage);

        }

    };

    // http://url?page=10&size=10
    http.open('GET', ITEMS_SERVICE_API + `?page=${PAGINATION.selectedPage}&size=${PAGE_SIZE}`, true);

    // 4. Setting headers, etc.

    http.send();

}

$('#btn-save').on('click', (eventData) => {
    eventData.preventDefault();

    const txtCode = $('#txt-code');
    const txtDesc = $('#txt-description');
    const txtPrice = $('#txt-price');
    const txtQty = $('#txt-qty');

    let code = (txtCode.val() as string).trim();
    let description = (txtDesc.val() as string).trim();
    let price = (txtPrice.val() as string).trim();
    let qty = (txtQty.val() as string).trim();

    let validated = true;
    $('#txt-id, #txt-name, #txt-address').removeClass('is-invalid');


    if (!/^\d+$/.test(qty)) {
        txtQty.addClass('is-invalid');
        txtQty.trigger('select');
        validated = false;
    }

    if (!/^\d+(.\d{2})?$/.test(price)) {
        txtPrice.addClass('is-invalid');
        txtPrice.trigger('select');
        validated = false;
    }

    if (!/^[A-Za-z ]+$/.test(description)) {
        txtDesc.addClass('is-invalid');
        txtDesc.trigger('select');
        validated = false;
    }

    if (!/^I\d{3}$/.test(code)) {
        txtCode.addClass('is-invalid');
        txtCode.trigger('select');
        validated = false;
    }

    if (!validated) return;

    if (txtCode.attr('disabled')) {

        const selectedRow = $("#tbl-items tbody tr.selected");
        updateItem(new Item(code, description, +price, +qty));
        return;
    }

    saveItem(new Item(code, description, +price, +qty));
});

function updateItem(item: Item): void {
    const http = new XMLHttpRequest();

    http.onreadystatechange = () => {

        if (http.readyState !== http.DONE) return;

        if (http.status !== 204) {
            alert("Failed to update the item, retry");
            return;
        }

        alert("item has been updated successfully");
        $("#tbl-items tbody tr.selected").find("td:nth-child(2)").text($("#txt-description").val() as string);
        $("#tbl-items tbody tr.selected").find("td:nth-child(3)").text($("#txt-qty").val() as string);
        $("#tbl-items tbody tr.selected").find("td:nth-child(4)").text($("#txt-price").val() as string);
        $('#txt-code, #txt-description, #txt-price, #txt-qty').val('');
        $('#txt-code').trigger('focus');
        $("#tbl-items tbody tr.selected").removeClass('selected');
        $('#txt-code').removeAttr('disabled');

    };

    http.open('PUT', ITEMS_SERVICE_API, true);

    http.setRequestHeader('Content-Type', 'application/json');

    http.send(JSON.stringify(item));

}

function saveItem(item: Item): void {
    const http = new XMLHttpRequest();

    http.onreadystatechange = () => {

        if (http.readyState !== http.DONE) return;

        if (http.status !== 201) {
            console.error(http.responseText);
            alert("Failed to save the item, retry");
            return;
        }

        alert("Customer has been saved successfully");

        totalItems++;
        PAGINATION.pageCount = Math.ceil(totalItems / PAGE_SIZE);

        PAGINATION.navigateToPage(PAGINATION.pageCount);
        $('#txt-code, #txt-description, #txt-price, #txt-qty').val('');
        $('#txt-code').trigger('focus');
    };

    http.open('POST', ITEMS_SERVICE_API, true);

    http.setRequestHeader('Content-Type', 'application/json');

    http.send(JSON.stringify(item));
}

$('#tbl-items tbody').on('click', 'tr', function () {

    const code = $(this).find("td:first-child").text();
    const desc = $(this).find("td:nth-child(2)").text();
    const qty = $(this).find("td:nth-child(3)").text();
    const price = $(this).find("td:nth-child(4)").text();

    $('#txt-code').val(code).attr('disabled', "true");
    $('#txt-description').val(desc);
    $('#txt-price').val(price);
    $('#txt-qty').val(qty);

    $("#tbl-items tbody tr").removeClass('selected');
    $(this).addClass('selected');

});

$('#tbl-items tbody').on('click', '.trash', function (eventData) {
    if (confirm('Are you sure to delete?')) {
        deleteItem(($(eventData.target).parents("tr").find('td:first-child')).text());
    }
});

function deleteItem(code: string): void {
    const http = new XMLHttpRequest();

    http.onreadystatechange = () => {

        if (http.readyState === http.DONE) {

            if (http.status !== 204) {
                alert("Failed to delete item, try again...!");
                return;
            }

            totalItems--;
            PAGINATION.pageCount = Math.ceil(totalItems / PAGE_SIZE);            
            PAGINATION.navigateToPage(PAGINATION.pageCount);

        }

    };

    http.open('DELETE', ITEMS_SERVICE_API + `?code=${code}`, true);

    http.send();
}

$('#btn-clear').on('click', () => {
    $("#tbl-items tbody tr.selected").removeClass('selected');
    $("#txt-code").removeAttr('disabled').trigger('focus');
});