import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Building2,
  CirclePlus,
  RefreshCw,
} from "lucide-react";

import {
  createOrganization,
  getMyOrganizations,
} from "../../services/organizationService";

import "./OrganizationPage.css";


function OrganizationPage() {
  const navigate =
    useNavigate();
  const [
    organizations,
    setOrganizations,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    name,
    setName,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    formError,
    setFormError,
  ] = useState("");


  const loadOrganizations =
    async () => {

      setLoading(true);
      setError("");

      try {
        const data =
          await getMyOrganizations();

        setOrganizations(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (requestError) {
        console.error(
          "Get organizations error:",
          requestError
        );

        setError(
          "دریافت سازمان‌های شما با خطا مواجه شد."
        );
      } finally {
        setLoading(false);
      }
    };


  useEffect(() => {
    loadOrganizations();
  }, []);


  const handleSubmit =
    async (event) => {

      event.preventDefault();

      setFormError("");


      const trimmedName =
        name.trim();

      const trimmedDescription =
        description.trim();


      if (
        trimmedName.length < 2
      ) {
        setFormError(
          "نام سازمان باید حداقل ۲ کاراکتر باشد."
        );

        return;
      }


      setSubmitting(true);


      try {
        const createdOrganization =
          await createOrganization({
            name: trimmedName,

            description:
              trimmedDescription ||
              null,
          });


        setOrganizations(
          (previousOrganizations) => [
            ...previousOrganizations,
            createdOrganization,
          ]
        );


        setName("");
        setDescription("");
      } catch (requestError) {
        console.error(
          "Create organization error:",
          requestError
        );


        const backendMessage =
          requestError
            ?.response
            ?.data
            ?.detail;


        setFormError(
          backendMessage ||
          "ایجاد سازمان با خطا مواجه شد."
        );
      } finally {
        setSubmitting(false);
      }
    };


  return (
    <section className="organization-page">

      <div className="organization-page-header">

        <div>
          <h2>
            سازمان‌ها
          </h2>

          <p>
            سازمان‌های عضو شده یا ساخته‌شده توسط شما
          </p>
        </div>

      </div>


      <div className="organization-layout">

        <div className="organization-create-card">

          <div className="organization-card-title">

            <CirclePlus
              size={21}
            />

            <div>
              <h3>
                ایجاد سازمان جدید
              </h3>

              <p>
                با ایجاد سازمان، شما به عنوان مالک آن ثبت می‌شوید.
              </p>
            </div>

          </div>


          <form
            className="organization-form"
            onSubmit={handleSubmit}
          >

            <div className="organization-field">

              <label
                htmlFor="organization-name"
              >
                نام سازمان
              </label>

              <input
                id="organization-name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                maxLength={150}
                placeholder="مثلاً شرکت توسعه نرم‌افزار"
              />

            </div>


            <div className="organization-field">

              <label
                htmlFor="organization-description"
              >
                توضیحات
              </label>

              <textarea
                id="organization-description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                maxLength={1000}
                rows={5}
                placeholder="توضیح کوتاهی درباره سازمان..."
              />

            </div>


            {formError && (
              <div className="organization-form-error">
                {formError}
              </div>
            )}


            <button
              type="submit"
              className="organization-submit-button"
              disabled={submitting}
            >

              {submitting
                ? (
                  <>
                    <RefreshCw
                      size={17}
                      className="organization-spinner"
                    />

                    در حال ایجاد...
                  </>
                )
                : (
                  <>
                    <CirclePlus
                      size={18}
                    />

                    ایجاد سازمان
                  </>
                )
              }

            </button>

          </form>

        </div>


        <div className="organization-list-card">

          <div className="organization-list-header">

            <div>
              <h3>
                سازمان‌های من
              </h3>

              <span>
                {organizations.length}
                {" "}
                سازمان
              </span>
            </div>


            <button
              type="button"
              className="organization-refresh-button"
              onClick={loadOrganizations}
              disabled={loading}
              aria-label="بارگذاری مجدد"
            >

              <RefreshCw
                size={18}
                className={
                  loading
                    ? "organization-spinner"
                    : ""
                }
              />

            </button>

          </div>


          {loading ? (
            <div className="organization-state">

              <RefreshCw
                size={25}
                className="organization-spinner"
              />

              <span>
                در حال دریافت سازمان‌ها...
              </span>

            </div>
          ) : error ? (
            <div className="organization-state organization-error">

              <p>
                {error}
              </p>

              <button
                type="button"
                onClick={loadOrganizations}
              >
                تلاش مجدد
              </button>

            </div>
          ) : organizations.length === 0 ? (
            <div className="organization-empty">

              <Building2
                size={42}
              />

              <h4>
                هنوز سازمانی ندارید
              </h4>

              <p>
                اولین سازمان خود را از فرم کنار صفحه ایجاد کنید.
              </p>

            </div>
          ) : (
            <div className="organization-list">

              {organizations.map(
                (organization) => (

                  <button
                    type="button"
                    key={organization.id}
                    className="organization-item organization-item-button"
                    onClick={() =>
                      navigate(
                        `/organizations/${organization.id}`,
                        {
                          state: {
                            organization,
                          },
                        }
                      )
                    }
                  >

                    <div className="organization-item-icon">

                      <Building2
                        size={22}
                      />

                    </div>


                    <div className="organization-item-content">

                      <h4>
                        {organization.name}
                      </h4>

                      <p>
                        {organization.description ||
                          "توضیحی ثبت نشده است."}
                      </p>

                      <span>
                        شناسه مالک:
                        {" "}
                        {organization.owner_id}
                      </span>

                    </div>

                  </button>

                )
              )}

            </div>
          )}

        </div>

      </div>

    </section>
  );
}


export default OrganizationPage;

