import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import AuthCard from "../../../components/common/AuthCard/AuthCard";
import AuthHeader from "../../../components/common/AuthHeader/AuthHeader";

import { loginUser } from "../../../services/authService";

import "./Login.css";


function Login() {


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();



  const onSubmit = async (data) => {

    try {

      console.log("Login data:", data);

      // بعداً با API واقعی Backend وصل می‌شود
      const response = await loginUser(data);

      console.log(response);


    } catch (error) {

      console.log(error);

    }

  };



  return (

    <AuthCard>


      <AuthHeader
      title="سیستم مدیریت پروژه"
      subtitle="ورود به پنل مدیریت سازمانی"
      />



      <form
        className="login-form"
        onSubmit={handleSubmit(onSubmit)}
      >


        <div className="form-group">


          <label>
            نام کاربری یا ایمیل
          </label>


          <input

            type="text"

            placeholder="admin@company.ir"


            {...register("email", {

              required:
                "وارد کردن ایمیل الزامی است",

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
          className="login-button"
        >

          ورود به سیستم

        </button>





        <div className="auth-links">


          <a href="#">
            رمز عبور خود را فراموش کرده‌اید؟
          </a>



          <p>

            هنوز ثبت نام نکرده‌اید؟

            {" "}


            <Link to="/register">
              ثبت نام
            </Link>


          </p>


        </div>



      </form>


    </AuthCard>

  );

}


export default Login;