use cumsdbms;
create table admin(
    personId int not null unique auto_increment,
    firstName varchar(255) not null,
    lastName varchar(255) not null,
    email varchar(255) not null unique,
    passwrd varchar(255) not null,
    primary key (personId)
);