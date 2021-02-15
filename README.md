# CUMS_DBMS (WIP)
🏰 A College Management Site (DBMS) using Node and Mysql.

A college management system (web application) that provides complete funtionality to manage enrollment, students, faculty, attendance, fees, scheduling,
assignments and grades for a particular college.It uses Node.js for backend and MySql as Database. It uses REST APIs for client server communications.


## Class Diagram

![documents/cms_db.png](documents/cms_db.png)

__Note: All attributes with :key: (key) are primary keys. We can update the db in future (final will be updated)


## Functionalities Of Our Project

Use cases have been divided based on the end user i.e. Admin, Staffs and Students.

### Functionalites for Admin :
1. Separate Authentication for Admin, and a dedicated admin dashboard.
2. Admin can(only) add new `staffs`, `students`, `departments`, `course` and `claases` in the database.
3. Admin can also update these data.

### Functionalites for Staffs :
1. Staffs can view the details of other `staffs`, `students` and `classes`.
2. Can update/add the attendance of a student (which belongs to it's class)
3. Can update the marks of a student. 
4. Can create assignments for other students.

**User can perform the above operations without writing any database query by using our simple and convenient User Interface.**


## NOTE

The project is still in progress. Tasks which still needs to be completed :
- Add time table feature
- Add attendance feature
- Build Student View.


