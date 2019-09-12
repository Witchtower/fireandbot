create table chars (
    id int primary key,
    name varchar(255)
);

create table items (
    id int primary key,
    de varchar(500),
    en varchar(500)
);

create table inventory (
    char_id int,
    item_id int,
    qty int,
    primary key(char_id, item_id)
);

insert into items (id, de, en) values (-1, 'testgegenstand', 'dummyitem');
insert into chars (id, name) values (-1, 'testchar');
insert into inventory (char_id, item_id, qty) values (-1, -1, 1337);