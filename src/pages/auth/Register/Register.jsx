import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import AuthCard from "../../../components/common/AuthCard/AuthCard";
import AuthHeader from "../../../components/common/AuthHeader/AuthHeader";

import { registerUser } from "../../../services/authService";

import "./Register.css";


function Register() {


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();



  const onSubmit = async (data) => {

    try {

      console.log("Register data:", data);

      const response = await registerUser(data);

      console.log(response);


    } catch (error) {

      console.log(error);

    }

  };



  return (

    <AuthCard>

      <AuthHeader
      title="سیستم مدیریت پروژه"
      subtitle="ایجاد حساب کاربری جدید"
      />


      <form
        className="register-form"
        onSubmit={handleSubmit(onSubmit)}
      >


        <div className="form-group">

          <label>
            نام کاربری
          </label>


          <input

            type="text"

            placeholder="نام کاربری"

            {...register("username", {

              required:
              "وارد کردن نام کاربری الزامی است"

            })}

          />


          {
            errors.username &&
            <span className="form-error">
              {errors.username.message}
            </span>
          }


        </div>




        <div className="form-group">

          <label>
            ایمیل
          </label>


          <input

            type="email"

            placeholder="example@company.ir"

            {...register("email", {

              required:
              "وارد کردن ایمیل الزامی است"

            })}

          />


          {
            errors.email &&
            <span className="form-error">
              {errors.email.message}
            </span>
          }


        </div>




        <div className="form-group">

          <label>
            رمز عبور
          </label>


          <input

            type="password"

            placeholder="••••••••"


            {...register("password", {

              required:
              "وارد کردن رمز عبور الزامی است",

              minLength: {

                value: 6,

                message:
                "رمز عبور حداقل باید ۶ کاراکتر باشد"

              }

            })}

          />


          {
            errors.password &&
            <span className="form-error">
              {errors.password.message}
            </span>
          }


        </div>



        <button
          type="submit"
          className="register-button"
        >

          ایجاد حساب

        </button>




        <div className="auth-links">

          <p>

            قبلاً ثبت نام کرده‌اید؟

            {" "}

            <Link to="/login">
              ورود
            </Link>

          </p>


        </div>


      </form>


    </AuthCard>

  );

}


export default Register;