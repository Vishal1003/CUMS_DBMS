# CUMS_DBMS (WIP)
🏰 A College Management Site (DBMS) using Node and Mysql.

A college management system (web application) that provides complete funtionality to manage enrollment, students, faculty, attendance, fees, scheduling,
assignments and grades for a particular college.It uses Node.js for backend and MySql as Database. It uses REST APIs for client server communications.

The purpose of this application is to automate the existing manual system by the help of computerized equipment and full-fledged computer software, fulfilling their requirements, so that their valuable data/information can be stored for a longer period with easy accessing and manipulation of the same. The required software and hardware are easily available and easy to work with.


## Product Features and User Classifications

There are several types of end users for the CMS. They are broadly divided as Students, Staff and the Administrator. Each of these classes have their own set of features

- **ADMIN** who can view and edit the details of any students/staff. Can add/edit departments, courses, classes and time-tables.
- **STAFF** who can view students details, add/update assignments, marks and attendance of a particular student.   They can see the time-table of a particular class also.
- **STUDENT** who can update profile/ add solution to assignments and see marks/attendance.


The features that are available to administrator are :

* An administrator can login into the system and perform any of the available operations :
    * add/view/modify/delete a student
    * add/view/modify/delete staff
    * add/modify department
    * add/modify courses
    * add/modify classes
    * can view the record of all the students and staff of a particular class/ course/ department.


The features that are available to staffs are :

* A staff can login into the system and perform any of the available operations :
    * view his/her personal details (name, dob, age, address, joining date)
    * edit his/her details 
    * view the department (s)he belongs to.
    * the classes they teach.
    * generate class report 
    * mark attendance of a particular student
    * update the attendance
    * see the time-table of a class.


The features that are available to students are :

* A student can login into the system and perform any of the following operations :
    * view his/her personal details (name, dob, age, address, joining date)
    * edit his/her details 
    * view the department (s)he belongs to.
    * the classes they belong
    * view his/her attendance
    * add solution to the assignment
    * view his/her marks


## System Design


### UseCase Diagram 

This is the use case diagram which depicts the user’s interaction with the system. It also shows the relationship between the user and the different use cases in which the user is involved.

![docs/usecase.png](docs/usecase.png)


### 3-tier Architecture

![docs/architecture.png](docs/architecture.png)


### Database Design 

We are using MySQL as our database. The main objective of this project is to use Relational Database and hence MySQL is the best choice for that. 

*User can perform the above operations without writing any database query by using our simple and convenient User Interface.*


**CLASS DIAGRAM**

![docs/db_design.png](docs/db_design.png)


**ER MODEL**

![docs/er_model.png](docs/er_model.png)



-------------------------------------------------------------------------------

**SEE THE COMPLETE REPORT HERE** ![docs/CMSNSIT_Report](docs/CMSNSIT_Report)