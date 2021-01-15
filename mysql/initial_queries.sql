use cumsdbms;
create table admin(
	PersonId int not null unique auto_increment,
	FirstName varchar(255) not null,
    LastName varchar(255) not null,
    Email varchar(255) not null unique,
    passwrd varchar(255) not null,
    primary key (PersonId)
);
insert into admin (FirstName, LastName, Email, passwrd) values ("Ram", "Gopal", "admin@nsut.ac.in", "admin");