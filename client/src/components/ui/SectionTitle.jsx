const SectionTitle = ({
    title,
    subtitle,
    action
}) => {

    return (

        <div className="mb-6 flex items-end justify-between">

            <div>

                <h2 className="text-3xl font-bold tracking-tight text-white">

                    {title}

                </h2>

                {subtitle && (

                    <p className="mt-2 text-white/55">

                        {subtitle}

                    </p>

                )}

            </div>

            {action}

        </div>

    )

}

export default SectionTitle;