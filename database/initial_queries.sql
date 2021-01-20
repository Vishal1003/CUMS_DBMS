use cumsdbms;
create table if not exists admin(
    personId int not null auto_increment,
    firstName varchar(255) not null,
    lastName varchar(255) not null,
    email varchar(255) not null unique,
    passwrd varchar(255) not null,
    primary key(personId)
);

create table if not exists student(
    studentId int not null auto_increment,
    passwrd varchar(255) not null unique,
    s_name varchar(255) not null,
    email varchar(255) not null,
    dob date not null,
    contact int not null,
    s_address varchar(255) not null,
    department varchar(255) not null,
    semId int not null,
    primary key(studentId),
    foreign key (semId, department)
    references semester (semId, department)
    on update cascade on delete restrict
);

create table if not exists semester(
    semId int not null,
    department varchar(255) not null,
    courses varchar(255) not null,
    primary key(semId, department)
);

create table if not exists course(
    courseId varchar(255) not null,
    courseName varchar(255) not null,
    department varchar(255) not null,
    semId int not null,
    primary key(courseId),
    foreign key (semId, department)
    references semester (semId, department)
    on update cascade on delete restrict
);

create table if not exists staff(
    staffId int not null auto_increment,
    passwrd varchar(255) not null unique,
    st_name varchar(255) not null,
    email varchar(255) not null,
    dob date not null,
    contact int not null,
    st_address varchar(255) not null,
    primary key(staffId)
);