use cums_dbms;
create table admin(
	PersonId int not null auto_increment,
	FirstName varchar(255) not null,
    LastName varchar(255) not null,
    passwrd varchar(255),
    primary key (PersonId)
);
insert into admin (FirstName,LastName,passwrd) values ("Ram","Gopal","admin");